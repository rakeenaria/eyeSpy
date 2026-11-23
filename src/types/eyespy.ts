export type YearFilter = 'all' | '2024' | '2025' | '2026';

export interface OfficialAnnualStat {
  tahun: number;
  crimeTotal: number | null;
  crimeClearance: number | null;
  clearanceRate: number | null;
  crimeIndex: number | null;
  crimeRate: number | null;
  crimeClock: string | null;
  lakaLantas: number | null;
  periodeLabel: string;
  sumberResmi: string;
  catatan: string | null;
}

export interface RegionStat {
  kabupaten: string;
  polres: string;
  totalKasus: number;
  kasusSelesai: number | null;
  catatan: string | null;
  sumberResmi: string;
  documentedCount: number;
}

export interface CategoryStat {
  namaJenis: string;
  jumlah: number;
  sumber: 'resmi' | 'terdokumentasi';
  catatan?: string | null;
}

export interface OfficialTkpStat {
  lokasiTkp: string;
  jumlah: number;
  sumberResmi: string;
}

export interface DashboardAnalytics {
  selectedYear: YearFilter;
  officialStats: OfficialAnnualStat[];
  activeOfficial: OfficialAnnualStat | null;
  kpi: {
    officialCrimeTotal: number | null;
    officialClearanceRate: number | null;
    officialClearanceCount: number | null;
    documentedTotal: number;
    documentedLocations: number;
    topRegionName: string;
    topRegionPolres: string;
    topRegionCount: number;
    topCategoryName: string;
    topCategoryCount: number;
    topCategoryScope: string;
    topTkpName: string;
    topTkpCount: number;
  };
  regionDistribution: RegionStat[];
  categoryDistribution: CategoryStat[];
  tkpDistribution: OfficialTkpStat[];
  recentIncidents: IncidentListItem[];
}

export interface IncidentListItem {
  id: number;
  idTempat: number;
  namaTempat: string;
  kabupaten: string;
  jenisKejahatan: string;
  waktu: string;
  keterangan: string;
  pelapor: 'pengguna' | 'sistem';
  sumberReferensi: string | null;
  cctvCameraId: string | null;
}

export interface IncidentDetail extends IncidentListItem {
  gambarTempat: string | null;
}

export interface LocationSummaryRow {
  idTempat: number;
  namaTempat: string;
  kabupaten: string;
  jumlahLaporan: number;
  variasiKejahatan: number;
  jenisTerbanyak: string;
  laporanTerakhir: string | null;
}

export interface CrimeTypeOption {
  idJenis: number;
  namaJenis: string;
}

export interface LocationOption {
  idTempat: number;
  namaTempat: string;
  kabupaten: string;
}

export interface CctvCamera {
  slug: string;
  source: string;
  sourceLabel: string;
  externalCameraId: string;
  name: string;
  aliasName: string | null;
  displayName: string;
  streamUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  groupName: string;
  visible: boolean;
  connected: boolean;
  lastMetadataSyncAt: string | null;
}

export interface CctvCatalogResponse {
  cameras: CctvCamera[];
  totalCount: number;
  onlineCount: number;
  offlineCount: number;
  groups: string[];
  storageReady: boolean;
  syncError: boolean;
  diyPortalMaintenance: boolean;
  lastSyncedAt: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
