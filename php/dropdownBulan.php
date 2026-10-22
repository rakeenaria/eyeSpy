<form method="GET" action="" class="filter-form">
    <?php if (isset($_GET['id'])): ?>
        <input type="hidden" name="id" value="<?php echo htmlspecialchars((string)$_GET['id'], ENT_QUOTES, 'UTF-8'); ?>">
    <?php endif; ?>
    <div class="select-wrapper">
        <select class="bulan-select" name="bulan" onchange="this.form.submit()" aria-label="Filter berdasarkan bulan">
            <option value="00" <?php if(!isset($_GET['bulan']) || $_GET['bulan'] == '00') echo 'selected'; ?>>Satu Tahun Penuh</option>
            <option value="01" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '01') echo 'selected'; ?>>Januari</option>
            <option value="02" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '02') echo 'selected'; ?>>Februari</option>
            <option value="03" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '03') echo 'selected'; ?>>Maret</option>
            <option value="04" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '04') echo 'selected'; ?>>April</option>
            <option value="05" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '05') echo 'selected'; ?>>Mei</option>
            <option value="06" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '06') echo 'selected'; ?>>Juni</option>
            <option value="07" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '07') echo 'selected'; ?>>Juli</option>
            <option value="08" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '08') echo 'selected'; ?>>Agustus</option>
            <option value="09" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '09') echo 'selected'; ?>>September</option>
            <option value="10" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '10') echo 'selected'; ?>>Oktober</option>
            <option value="11" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '11') echo 'selected'; ?>>November</option>
            <option value="12" <?php if(isset($_GET['bulan']) && $_GET['bulan'] == '12') echo 'selected'; ?>>Desember</option>
        </select>
    </div>
</form>
