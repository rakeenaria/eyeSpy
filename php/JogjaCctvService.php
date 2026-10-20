<?php
declare(strict_types=1);

/**
 * Mengambil metadata kamera publik dari portal resmi Jogja Istimewa.
 * Database menjadi cache metadata selama lima menit dan sumber fallback terakhir
 * apabila API resmi sedang tidak dapat dijangkau.
 */
final class JogjaCctvService
{
    public const SOURCE = 'jogja-istimewa';

    private const API_URL = 'https://cctv.jogjaprov.go.id/api/v1/location-pins?fields%5Blocation-pins%5D=name,alias_name,stream_url,lat,lng,group_name,visible,connected';
    private const CACHE_TTL_SECONDS = 300;
    private const SYNC_LOCK_NAME = 'eyespy_cctv_sync_jogja';

    /**
     * @return array{cameras: array<int, array<string, mixed>>, storage_ready: bool, sync_error: bool}
     */
    public static function listCameras(mysqli $connection): array
    {
        if (!self::storageReady($connection)) {
            return array('cameras' => array(), 'storage_ready' => false, 'sync_error' => false);
        }

        $sync = self::refreshIfStale($connection);
        $statement = $connection->prepare(
            'SELECT source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
                    group_name, visible, connected, last_metadata_sync_at
             FROM cctv_camera
             WHERE source = ?
               AND source_active = 1
               AND visible = 1
               AND stream_url IS NOT NULL
               AND stream_url <> ""
             ORDER BY connected DESC, COALESCE(NULLIF(alias_name, ""), name) ASC, external_camera_id ASC'
        );

        if (!$statement) {
            error_log('CCTV catalog query could not be prepared.');
            return array('cameras' => array(), 'storage_ready' => true, 'sync_error' => true);
        }

        $source = self::SOURCE;
        $statement->bind_param('s', $source);
        $statement->execute();
        $result = $statement->get_result();
        $cameras = $result ? $result->fetch_all(MYSQLI_ASSOC) : array();
        $statement->close();

        foreach ($cameras as &$camera) {
            $camera['visible'] = (bool) $camera['visible'];
            $camera['connected'] = (bool) $camera['connected'];
        }
        unset($camera);

        return array(
            'cameras' => $cameras,
            'storage_ready' => true,
            'sync_error' => $sync['error'],
        );
    }

    /**
     * @return array{camera: array<string, mixed>|null, storage_ready: bool, sync_error: bool}
     */
    public static function findCamera(mysqli $connection, string $source, string $externalCameraId): array
    {
        if ($source !== self::SOURCE || !preg_match('/^[A-Za-z0-9_-]{1,64}$/', $externalCameraId)) {
            return array('camera' => null, 'storage_ready' => self::storageReady($connection), 'sync_error' => false);
        }

        if (!self::storageReady($connection)) {
            return array('camera' => null, 'storage_ready' => false, 'sync_error' => false);
        }

        $sync = self::refreshIfStale($connection);
        $statement = $connection->prepare(
            'SELECT source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
                    group_name, visible, connected, last_metadata_sync_at
             FROM cctv_camera
             WHERE source = ?
               AND external_camera_id = ?
               AND source_active = 1
               AND visible = 1
             LIMIT 1'
        );

        if (!$statement) {
            error_log('CCTV detail query could not be prepared.');
            return array('camera' => null, 'storage_ready' => true, 'sync_error' => true);
        }

        $statement->bind_param('ss', $source, $externalCameraId);
        $statement->execute();
        $result = $statement->get_result();
        $camera = $result ? $result->fetch_assoc() : null;
        $statement->close();

        if (is_array($camera)) {
            $camera['visible'] = (bool) $camera['visible'];
            $camera['connected'] = (bool) $camera['connected'];
        }

        return array('camera' => $camera, 'storage_ready' => true, 'sync_error' => $sync['error']);
    }

    /** @return array{error: bool} */
    private static function refreshIfStale(mysqli $connection): array
    {
        if (self::isCacheFresh($connection)) {
            return array('error' => false);
        }

        if (!self::acquireLock($connection)) {
            return array('error' => false);
        }

        try {
            // Request lain mungkin telah menyelesaikan sinkronisasi sambil kita menunggu lock.
            if (self::isCacheFresh($connection)) {
                return array('error' => false);
            }

            $cameras = self::fetchMetadata();
            self::storeMetadata($connection, $cameras);
            return array('error' => false);
        } catch (Throwable $exception) {
            // Detail teknis hanya masuk log server; UI memakai pesan umum dan data cache terakhir.
            error_log('CCTV metadata synchronization failed: ' . $exception->getMessage());
            self::recordSyncFailure($connection);
            return array('error' => true);
        } finally {
            self::releaseLock($connection);
        }
    }

    private static function storageReady(mysqli $connection): bool
    {
        $result = $connection->query(
            "SELECT COUNT(*) AS table_count
             FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME IN ('cctv_camera', 'cctv_sync_state')"
        );

        if (!$result) {
            return false;
        }

        $row = $result->fetch_assoc();
        return isset($row['table_count']) && (int) $row['table_count'] === 2;
    }

    private static function isCacheFresh(mysqli $connection): bool
    {
        $statement = $connection->prepare(
            'SELECT last_successful_sync_at FROM cctv_sync_state WHERE source = ? LIMIT 1'
        );
        if (!$statement) {
            return false;
        }

        $source = self::SOURCE;
        $statement->bind_param('s', $source);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        $statement->close();

        if (!is_array($row) || empty($row['last_successful_sync_at'])) {
            return false;
        }

        $lastSync = strtotime((string) $row['last_successful_sync_at']);
        return $lastSync !== false && (time() - $lastSync) < self::CACHE_TTL_SECONDS;
    }

    private static function acquireLock(mysqli $connection): bool
    {
        $statement = $connection->prepare('SELECT GET_LOCK(?, 2) AS acquired');
        if (!$statement) {
            return false;
        }

        $lockName = self::SYNC_LOCK_NAME;
        $statement->bind_param('s', $lockName);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        $statement->close();

        return is_array($row) && (int) $row['acquired'] === 1;
    }

    private static function releaseLock(mysqli $connection): void
    {
        $statement = $connection->prepare('SELECT RELEASE_LOCK(?)');
        if (!$statement) {
            return;
        }

        $lockName = self::SYNC_LOCK_NAME;
        $statement->bind_param('s', $lockName);
        $statement->execute();
        $statement->close();
    }

    /** @return array<int, array<string, mixed>> */
    private static function fetchMetadata(): array
    {
        $handle = curl_init(self::API_URL);
        if ($handle === false) {
            throw new RuntimeException('Unable to initialize the metadata request.');
        }

        curl_setopt_array($handle, array(
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => array('Accept: application/vnd.api+json, application/json'),
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'EyeSpy CCTV metadata sync/1.0',
        ));

        $body = curl_exec($handle);
        $curlError = curl_error($handle);
        $httpStatus = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
        $contentType = (string) curl_getinfo($handle, CURLINFO_CONTENT_TYPE);
        curl_close($handle);

        if ($body === false || $curlError !== '') {
            throw new RuntimeException('The metadata request could not be completed.');
        }
        if ($httpStatus < 200 || $httpStatus >= 300) {
            throw new RuntimeException('The metadata endpoint returned an unsuccessful HTTP status.');
        }
        if (stripos($contentType, 'json') === false) {
            throw new RuntimeException('The metadata endpoint did not return JSON.');
        }

        try {
            $payload = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new RuntimeException('The metadata response was not valid JSON.', 0, $exception);
        }

        if (!is_array($payload) || !isset($payload['data']) || !is_array($payload['data'])) {
            throw new RuntimeException('The metadata response did not contain a JSON:API data array.');
        }

        $cameras = array();
        foreach ($payload['data'] as $item) {
            $camera = self::normalizeCamera($item);
            if ($camera !== null) {
                $cameras[] = $camera;
            }
        }

        if (count($cameras) === 0) {
            throw new RuntimeException('The metadata response contained no valid camera records.');
        }

        return $cameras;
    }

    /** @return array<string, mixed>|null */
    private static function normalizeCamera(mixed $item): ?array
    {
        if (!is_array($item) || !isset($item['attributes']) || !is_array($item['attributes'])) {
            return null;
        }

        $attributes = $item['attributes'];
        $externalId = self::limitText($item['id'] ?? '', 64);
        $name = self::limitText($attributes['name'] ?? '', 255);
        $aliasName = self::limitText($attributes['alias_name'] ?? '', 255);

        if ($externalId === '' || ($name === '' && $aliasName === '')) {
            return null;
        }

        return array(
            'external_camera_id' => $externalId,
            'name' => $name !== '' ? $name : $aliasName,
            'alias_name' => $aliasName !== '' ? $aliasName : null,
            'stream_url' => self::normalizeHlsUrl($attributes['stream_url'] ?? null),
            'latitude' => self::normalizeCoordinate($attributes['lat'] ?? null, -90.0, 90.0),
            'longitude' => self::normalizeCoordinate($attributes['lng'] ?? null, -180.0, 180.0),
            'group_name' => self::nullableText($attributes['group_name'] ?? null, 255),
            'visible' => self::toBoolean($attributes['visible'] ?? false) ? 1 : 0,
            'connected' => self::toBoolean($attributes['connected'] ?? false) ? 1 : 0,
        );
    }

    /** @param array<int, array<string, mixed>> $cameras */
    private static function storeMetadata(mysqli $connection, array $cameras): void
    {
        $now = date('Y-m-d H:i:s');
        $source = self::SOURCE;

        if (!$connection->begin_transaction()) {
            throw new RuntimeException('The metadata cache transaction could not be started.');
        }

        try {
            $deactivate = $connection->prepare('UPDATE cctv_camera SET source_active = 0 WHERE source = ?');
            if (!$deactivate) {
                throw new RuntimeException('The camera cache could not be updated.');
            }
            $deactivate->bind_param('s', $source);
            $deactivate->execute();
            $deactivate->close();

            $upsert = $connection->prepare(
                'INSERT INTO cctv_camera
                    (source, external_camera_id, name, alias_name, stream_url, latitude, longitude,
                     group_name, visible, connected, source_active, last_metadata_sync_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
                 ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    alias_name = VALUES(alias_name),
                    stream_url = VALUES(stream_url),
                    latitude = VALUES(latitude),
                    longitude = VALUES(longitude),
                    group_name = VALUES(group_name),
                    visible = VALUES(visible),
                    connected = VALUES(connected),
                    source_active = 1,
                    last_metadata_sync_at = VALUES(last_metadata_sync_at)'
            );
            if (!$upsert) {
                throw new RuntimeException('The camera cache could not be prepared.');
            }

            $externalId = '';
            $name = '';
            $aliasName = null;
            $streamUrl = null;
            $latitude = null;
            $longitude = null;
            $groupName = null;
            $visible = 0;
            $connected = 0;
            $upsert->bind_param(
                'ssssssssiis',
                $source,
                $externalId,
                $name,
                $aliasName,
                $streamUrl,
                $latitude,
                $longitude,
                $groupName,
                $visible,
                $connected,
                $now
            );

            foreach ($cameras as $camera) {
                $externalId = (string) $camera['external_camera_id'];
                $name = (string) $camera['name'];
                $aliasName = $camera['alias_name'];
                $streamUrl = $camera['stream_url'];
                $latitude = $camera['latitude'];
                $longitude = $camera['longitude'];
                $groupName = $camera['group_name'];
                $visible = (int) $camera['visible'];
                $connected = (int) $camera['connected'];

                if (!$upsert->execute()) {
                    throw new RuntimeException('A camera record could not be saved.');
                }
            }
            $upsert->close();

            $state = $connection->prepare(
                'INSERT INTO cctv_sync_state
                    (source, last_successful_sync_at, last_attempt_at, last_error_at, last_error_message)
                 VALUES (?, ?, ?, NULL, NULL)
                 ON DUPLICATE KEY UPDATE
                    last_successful_sync_at = VALUES(last_successful_sync_at),
                    last_attempt_at = VALUES(last_attempt_at),
                    last_error_at = NULL,
                    last_error_message = NULL'
            );
            if (!$state) {
                throw new RuntimeException('The synchronization status could not be saved.');
            }
            $state->bind_param('sss', $source, $now, $now);
            $state->execute();
            $state->close();

            $connection->commit();
        } catch (Throwable $exception) {
            $connection->rollback();
            throw $exception;
        }
    }

    private static function recordSyncFailure(mysqli $connection): void
    {
        $statement = $connection->prepare(
            'INSERT INTO cctv_sync_state
                (source, last_successful_sync_at, last_attempt_at, last_error_at, last_error_message)
             VALUES (?, NULL, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                last_attempt_at = VALUES(last_attempt_at),
                last_error_at = VALUES(last_error_at),
                last_error_message = VALUES(last_error_message)'
        );
        if (!$statement) {
            return;
        }

        $source = self::SOURCE;
        $now = date('Y-m-d H:i:s');
        $message = 'Metadata sementara tidak dapat diperbarui.';
        $statement->bind_param('ssss', $source, $now, $now, $message);
        $statement->execute();
        $statement->close();
    }

    private static function normalizeHlsUrl(mixed $value): ?string
    {
        if (!is_string($value)) {
            return null;
        }

        $url = trim($value);
        if ($url === '' || strlen($url) > 2048 || preg_match('/[\x00-\x1F\x7F]/', $url)) {
            return null;
        }

        $parts = parse_url($url);
        if (!is_array($parts)
            || ($parts['scheme'] ?? '') !== 'https'
            || empty($parts['host'])
            || isset($parts['user'])
            || isset($parts['pass'])
            || !preg_match('/\.m3u8(?:$|[?#])/i', $url)) {
            return null;
        }

        return $url;
    }

    private static function normalizeCoordinate(mixed $value, float $minimum, float $maximum): ?string
    {
        if (!is_numeric($value)) {
            return null;
        }

        $coordinate = (float) $value;
        if (!is_finite($coordinate) || $coordinate < $minimum || $coordinate > $maximum) {
            return null;
        }

        return number_format($coordinate, 8, '.', '');
    }

    private static function toBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        return in_array(strtolower((string) $value), array('1', 'true', 'yes'), true);
    }

    private static function nullableText(mixed $value, int $maximumLength): ?string
    {
        $text = self::limitText($value, $maximumLength);
        return $text === '' ? null : $text;
    }

    private static function limitText(mixed $value, int $maximumLength): string
    {
        if (!is_scalar($value)) {
            return '';
        }

        $text = trim((string) $value);
        if (function_exists('mb_substr')) {
            return mb_substr($text, 0, $maximumLength);
        }

        return substr($text, 0, $maximumLength);
    }
}
