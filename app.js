const STORAGE_KEY = "culturalVenueCrm.records.v1";
const USERS_KEY = "culturalVenueCrm.users.v1";
const CURRENT_USER_KEY = "culturalVenueCrm.currentUser.v1";
const AUTH_SESSION_KEY = "culturalVenueCrm.authSession.v1";
const NOTIFICATION_SETTINGS_KEY = "culturalVenueCrm.notifications.v1";
const CALL_HISTORY_KEY = "culturalVenueCrm.callHistory.v1";
const COLUMN_ORDER_KEY = "culturalVenueCrm.columnOrder.v1";
const STATUS_OPTIONS_KEY = "culturalVenueCrm.statusOptions.v1";
const PINNED_COLUMNS_KEY = "culturalVenueCrm.pinnedColumns.v1";
const VISIBLE_COLUMNS_KEY = "culturalVenueCrm.visibleColumns.v1";
const COLUMN_SCHEMA_VERSION_KEY = "culturalVenueCrm.columnSchemaVersion.v1";
const STATUS_META_KEY = "culturalVenueCrm.statusMeta.v1";
const TEMPERATURE_META_KEY = "culturalVenueCrm.temperatureMeta.v1";
const COLUMN_SCHEMA_VERSION = 3;

const defaultStatuses = ["未着手", "情報収集中", "初回連絡済", "提案中", "見積・調整中", "成約", "保留", "架電NG"];
const defaultStatusMeta = {
  未着手: { color: "#3d7a52", isClosed: false },
  情報収集中: { color: "#1d6a73", isClosed: false },
  初回連絡済: { color: "#5d6780", isClosed: false },
  提案中: { color: "#9b6b00", isClosed: false },
  "見積・調整中": { color: "#9b6b00", isClosed: false },
  成約: { color: "#265f9e", isClosed: true },
  保留: { color: "#666666", isClosed: true },
  架電NG: { color: "#5f6865", isClosed: true },
};
const priorities = ["A", "B", "C", "D", "E"];
const defaultTemperatureMeta = {
  A: { label: "高い", color: "#c63f2d" },
  B: { label: "前向き", color: "#b86b00" },
  C: { label: "通常", color: "#5b6f82" },
  D: { label: "低め", color: "#6c7a70" },
  E: { label: "見送り", color: "#6b6f73" },
};
const programPolicyOptions = ["○", "△", "×"];
const roleLabels = {
  admin: "管理",
  staff: "スタッフ",
};
const japanPrefectures = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];
const prefectureInferenceRules = [
  {
    prefecture: "奈良県",
    keywords: [
      "奈良",
      "なら100年",
      "ならまち",
      "やまと郡山",
      "大和郡山",
      "大和高田",
      "三宅町",
      "三郷町",
      "上牧町",
      "下市",
      "五條",
      "北コミュニティセンターISTA",
      "南コミュニティセンターせせらぎ",
      "大淀町",
      "天理",
      "宇陀",
      "山添村",
      "川西文化会館",
      "斑鳩",
      "桜井",
      "橿原",
      "河合町",
      "王寺町",
      "生駒",
      "田原本",
      "葛城",
      "香芝",
      "高取町",
      "鹿ノ台",
      "たけまる",
      "芸術会館美楽来",
    ],
  },
  {
    prefecture: "埼玉県",
    keywords: [
      "埼玉",
      "さいたま",
      "彩の国",
      "川越",
      "八潮",
      "やしお",
      "ときがわ",
      "ふじみ野",
      "三芳町",
      "三郷市",
      "上尾",
      "上里町",
      "久喜",
      "入間",
      "加須",
      "北本",
      "吉見町",
      "和光",
      "坂戸",
      "富士見市",
      "小川町",
      "川口",
      "川島町",
      "幸手",
      "庄和",
      "戸田",
      "所沢",
      "新座",
      "日高",
      "春日部",
      "朝霞",
      "本庄",
      "東松山",
      "東部地域振興",
      "松伏町",
      "桶川",
      "毛呂山",
      "深谷",
      "熊谷",
      "狭山",
      "秩父",
      "美里町遺跡",
      "羽生",
      "草加",
      "蓮田",
      "蕨",
      "行田",
      "越谷",
      "飯能",
      "鳩山",
      "鴻巣",
      "鶴ヶ島",
    ],
  },
  {
    prefecture: "神奈川県",
    keywords: [
      "神奈川",
      "かながわ",
      "あつぎ",
      "厚木",
      "やまと芸術文化",
      "大和市",
      "ラゾーナ川崎",
      "川崎",
      "かわさき",
      "二宮町",
      "伊勢原",
      "南足柄",
      "寒川",
      "小田原",
      "平塚",
      "座間",
      "新百合",
      "杜のホールはしもと",
      "横浜",
      "横須賀",
      "海老名",
      "相模原",
      "秦野",
      "箱根",
      "綾瀬",
      "茅ヶ崎",
      "葉山",
      "藤沢",
      "逗子",
      "鎌倉",
      "愛川",
    ],
  },
  {
    prefecture: "三重県",
    keywords: [
      "三重",
      "川越町",
      "あやま",
      "いなべ",
      "伊勢",
      "伊賀",
      "南伊勢",
      "名張",
      "四日市",
      "多気",
      "亀山",
      "尾鷲",
      "御浜",
      "志摩",
      "東員",
      "松阪",
      "桑名",
      "津リージョン",
      "津市",
      "熊野",
      "紀北",
      "紀宝",
      "鈴鹿",
      "青山ホール",
    ],
  },
];

const fieldLabels = {
  facilityName: "施設名",
  category: "種別",
  operator: "管理運営機関",
  prefecture: "都道府県",
  municipality: "市区町村",
  address: "住所",
  phone: "電話番号",
  fax: "FAX",
  email: "アドレス",
  website: "Webサイト",
  department: "担当部署",
  contactName: "担当者",
  mainHallName: "主ホール名",
  seatCount: "客席数",
  largeHallSeats: "大ホール席数",
  mediumHallSeats: "中ホール席数",
  smallHallSeats: "小ホール席数",
  genres: "得意ジャンル",
  programPolicy: "自主事業",
  status: "状態",
  priority: "温度感",
  rating: "温度感",
  isHidden: "非表示",
  assignedUserId: "担当スタッフ",
  lastContactDate: "最終接触日",
  callUpdatedAt: "架電更新日",
  callUpdatedByUserId: "架電者",
  considerationDate: "検討時期",
  nextActionDate: "次回架電日",
  notificationLeadDays: "通知日数",
  nextAction: "次回アクション",
  notesImportant: "重要メモ",
  notes: "備考",
};

const csvAliases = {
  facilityName: ["施設名", "会館名", "ホール名", "劇場名", "名称", "name", "facility", "venue"],
  category: ["種別", "分類", "施設種別", "category", "type"],
  operator: ["管理運営機関", "運営主体", "運営者", "指定管理者", "管理者", "operator"],
  prefecture: ["都道府県", "都道府県名", "県", "県名", "prefecture", "pref"],
  municipality: ["市区町村", "自治体", "市町村", "municipality", "city"],
  address: ["住所", "所在地", "address"],
  phone: ["電話", "電話番号", "tel", "phone"],
  fax: ["fax", "fax番号", "ファックス"],
  email: ["アドレス", "メール", "メールアドレス", "email", "mail"],
  website: ["web", "website", "url", "サイト", "ホームページ"],
  department: ["担当部署", "部署", "department"],
  contactName: ["担当者", "担当者名", "contact", "person"],
  mainHallName: ["主ホール", "主ホール名", "ホール名", "main hall", "hall name"],
  seatCount: ["客席数", "座席数", "席数", "capacity", "seats"],
  largeHallSeats: ["大ホール席数", "大席数", "大ホール規模", "large hall seats", "large seats"],
  mediumHallSeats: ["中ホール席数", "中席数", "中ホール規模", "medium hall seats", "medium seats"],
  smallHallSeats: ["小ホール席数", "小席数", "小ホール規模", "small hall seats", "small seats"],
  genres: ["ジャンル", "得意ジャンル", "公演ジャンル", "genres"],
  programPolicy: ["自主事業", "主催事業", "program", "policy"],
  status: ["状態", "ステータス", "営業状況", "status"],
  priority: ["温度感", "優先度", "評価", "ランク", "priority", "rank", "rating", "score"],
  rating: ["旧評価", "評点"],
  isHidden: ["非表示", "表示状態", "hidden", "hide"],
  assignedUserId: ["担当スタッフ", "担当営業", "担当者id", "assignee", "owner"],
  lastContactDate: ["最終接触日", "最終連絡日", "last contact"],
  callUpdatedAt: ["架電更新日", "最終更新日", "架電最終更新日", "call updated", "call updated at"],
  callUpdatedByUserId: ["架電者", "最終更新者", "更新者", "caller", "call user"],
  considerationDate: ["検討時期", "検討日", "検討予定", "consideration date", "review date"],
  nextActionDate: ["次回対応日", "次回連絡日", "次回架電日", "架電日", "next date", "follow up"],
  notificationLeadDays: ["通知日数", "通知日前", "何日前通知", "notification days", "lead days"],
  nextAction: ["次回アクション", "次の対応", "next action"],
  notesImportant: ["重要メモ", "重要", "important note", "important"],
  notes: ["メモ", "備考", "営業メモ", "notes"],
};

const requiredChecks = [
  { field: "phone", text: "代表電話または文化事業担当の直通番号を確認" },
  { field: "department", text: "公演・自主事業を担当する部署名を確認" },
  { field: "contactName", text: "企画担当者または受付窓口の氏名を確認" },
  { field: "email", text: "企画書送付先メールアドレスを確認" },
  { field: "mainHallName", text: "提案対象になる主ホール名を確認" },
  { field: "largeHallSeats", text: "ホール規模（大・中・小）を確認" },
  { field: "genres", text: "過去に扱った公演ジャンルや関心領域を確認" },
  { field: "nextAction", text: "次回アクションを決めて記録" },
  { field: "nextActionDate", text: "次回架電日を設定" },
];

const seedUsers = [
  {
    id: makeId(),
    name: "管理者",
    loginId: "admin",
    email: "admin@example.jp",
    role: "admin",
    authPassword: "password",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: makeId(),
    name: "営業スタッフ",
    loginId: "staff",
    email: "staff@example.jp",
    role: "staff",
    authPassword: "password",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const seedVenues = [
  {
    id: makeId(),
    facilityName: "みどり市文化会館",
    category: "文化会館",
    operator: "みどり市",
    prefecture: "群馬県",
    municipality: "みどり市",
    address: "群馬県みどり市笠懸町阿左美",
    phone: "0277-00-0000",
    fax: "",
    email: "bunka@example.jp",
    website: "https://example.jp/midori",
    department: "文化振興課",
    contactName: "企画担当",
    mainHallName: "大ホール",
    seatCount: "900",
    largeHallSeats: "900",
    mediumHallSeats: "",
    smallHallSeats: "",
    genres: "演劇、音楽、ファミリー",
    programPolicy: "○",
    status: "提案中",
    priority: "A",
    rating: "A",
    isHidden: false,
    assignedUserId: seedUsers[1].id,
    lastContactDate: "2026-05-01",
    callUpdatedAt: "2026-05-01T09:00:00.000Z",
    callUpdatedByUserId: seedUsers[1].id,
    considerationDate: "2026-07-15",
    nextActionDate: "2026-05-15",
    notificationLeadDays: "7",
    nextAction: "過去公演実績を添えて企画書を再送",
    notesImportant: true,
    notes: "年度後半の自主公演枠を検討中。家族向け企画への反応がよい。",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: makeId(),
    facilityName: "東町公会堂",
    category: "公会堂",
    operator: "東町",
    prefecture: "埼玉県",
    municipality: "東町",
    address: "埼玉県東町中央",
    phone: "048-000-0000",
    fax: "",
    email: "",
    website: "",
    department: "",
    contactName: "",
    mainHallName: "ホール",
    seatCount: "520",
    largeHallSeats: "520",
    mediumHallSeats: "",
    smallHallSeats: "",
    genres: "",
    programPolicy: "△",
    status: "情報収集中",
    priority: "B",
    rating: "B",
    isHidden: false,
    assignedUserId: seedUsers[1].id,
    lastContactDate: "",
    callUpdatedAt: "",
    callUpdatedByUserId: "",
    considerationDate: "",
    nextActionDate: "",
    notificationLeadDays: "",
    nextAction: "自治体サイトで担当部署を確認",
    notesImportant: false,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const defaultNotificationSettings = {
  enabled: false,
  leadDays: 3,
  popupLeadDays: 3,
  displayMode: "badge",
  scope: "assigned",
  dismissCondition: "nextActionDate",
  notified: {},
  dismissed: {},
};

const notificationDisplayModes = {
  badge: "バッジ",
  badgeDays: "バッジ＋日数",
  days: "残り日数",
  date: "架電日",
};

const notificationScopes = {
  assigned: "自分の担当のみ",
  all: "全施設",
};

const tableColumns = [
  {
    id: "programPolicy",
    label: "自主事業",
    cell: (venue) => inlineSelect(venue, "programPolicy", programPolicyOptions, "program-policy-control"),
  },
  {
    id: "facilityName",
    label: "施設名",
    cell: (venue) => `
      <div class="venue-name">
        <strong>${escapeHtml(venue.facilityName || "名称未設定")}</strong>
        <span>${escapeHtml(venue.category || "種別未設定")}</span>
      </div>
    `,
  },
  {
    id: "operator",
    label: "管理運営機関",
    cell: (venue) => inlineInput(venue, "operator", "text", "管理運営機関"),
  },
  {
    id: "priority",
    label: "温度感",
    cell: (venue) => inlineTemperatureSelect(venue),
  },
  {
    id: "notification",
    label: "通知",
    cell: (venue) => notificationBadgeMarkup(venue),
  },
  {
    id: "notificationLeadDays",
    label: "通知日数",
    cell: (venue) => notificationLeadDaysInput(venue),
  },
  {
    id: "location",
    label: "所在地",
    cell: (venue) => escapeHtml([venue.prefecture, venue.municipality].filter(Boolean).join(" ") || "-"),
  },
  {
    id: "phone",
    label: "電話",
    cell: (venue) => inlineInput(venue, "phone", "tel", "電話"),
  },
  {
    id: "email",
    label: "アドレス",
    cell: (venue) => inlineInput(venue, "email", "email", "アドレス"),
  },
  {
    id: "status",
    label: "状態",
    cell: (venue) => inlineSelect(venue, "status", statusOptions),
  },
  {
    id: "contactName",
    label: "担当者",
    cell: (venue) => inlineInput(venue, "contactName", "text", "担当者"),
  },
  {
    id: "callStatus",
    label: "架電状況",
    cell: (venue) => callStatusMarkup(venue),
  },
  {
    id: "callUpdatedByUserId",
    label: "架電者",
    cell: (venue) => escapeHtml(getUserName(venue.callUpdatedByUserId) || "-"),
  },
  {
    id: "considerationDate",
    label: "検討時期",
    cell: (venue) => inlineInput(venue, "considerationDate", "date", "検討時期"),
  },
  {
    id: "nextActionDate",
    label: "次回架電",
    cell: (venue) => inlineInput(venue, "nextActionDate", "date", "次回架電日", callDateClass(venue)),
  },
  {
    id: "nextAction",
    label: "次回アクション",
    cell: (venue) => inlineInput(venue, "nextAction", "text", "次回アクション"),
  },
  {
    id: "hallScale",
    label: "ホール規模",
    cell: (venue) => hallScaleInputs(venue),
  },
  {
    id: "visibility",
    label: "表示",
    cell: (venue) => inlineVisibilitySelect(venue),
  },
  {
    id: "notes",
    label: "備考",
    cell: (venue) => notesButtonMarkup(venue),
  },
];

const defaultColumnOrder = tableColumns.map((column) => column.id);
const columnWidthHints = {
  programPolicy: 100,
  facilityName: 230,
  operator: 180,
  priority: 92,
  notification: 84,
  notificationLeadDays: 132,
  location: 140,
  phone: 150,
  email: 210,
  status: 120,
  contactName: 150,
  callStatus: 180,
  callUpdatedByUserId: 130,
  considerationDate: 150,
  nextActionDate: 150,
  nextAction: 250,
  hallScale: 250,
  visibility: 110,
  notes: 110,
};
const columnPresets = {
  call: {
    label: "架電向け",
    columns: [
      "programPolicy",
      "facilityName",
      "priority",
      "notification",
      "notificationLeadDays",
      "phone",
      "email",
      "status",
      "contactName",
      "callStatus",
      "callUpdatedByUserId",
      "considerationDate",
      "nextActionDate",
      "nextAction",
      "notes",
    ],
  },
  facility: {
    label: "施設情報",
    columns: [
      "programPolicy",
      "facilityName",
      "operator",
      "location",
      "phone",
      "email",
      "contactName",
      "hallScale",
      "notes",
    ],
  },
  management: {
    label: "管理向け",
    columns: [
      "facilityName",
      "operator",
      "priority",
      "status",
      "notificationLeadDays",
      "callUpdatedByUserId",
      "considerationDate",
      "nextActionDate",
      "visibility",
      "notes",
    ],
  },
  all: {
    label: "すべて",
    columns: defaultColumnOrder,
  },
};
const importantHistoryFields = new Set([
  "programPolicy",
  "priority",
  "status",
  "contactName",
  "callUpdatedByUserId",
  "considerationDate",
  "nextActionDate",
  "notificationLeadDays",
  "nextAction",
  "notes",
  "isHidden",
]);

let users = loadUsers();
let currentUserId = loadCurrentUserId();
let venues = loadVenues();
let selectedId = getInitialSelectedId();
let pendingImport = [];
let pendingImportSource = [];
let pendingImportHeaders = [];
let pendingMap = {};
let notificationSettings = loadNotificationSettings();
let callHistory = loadCallHistory();
let columnOrders = loadColumnOrders();
let statusOptions = loadStatusOptions();
let pinnedColumns = loadPinnedColumns();
let visibleColumns = loadVisibleColumns();
let statusMeta = loadStatusMeta();
let temperatureMeta = loadTemperatureMeta();
let notificationTimer = null;
let saveStatusTimer = null;
let lastUndoSnapshot = null;
let remoteDataReady = false;
let remoteSaveNoticeShown = false;

const elements = {
  metricTotal: document.querySelector("#metricTotal"),
  metricTodo: document.querySelector("#metricTodo"),
  metricProposal: document.querySelector("#metricProposal"),
  metricDue: document.querySelector("#metricDue"),
  managementSectionSelect: document.querySelector("#managementSectionSelect"),
  csvFile: document.querySelector("#csvFile"),
  importPrefecture: document.querySelector("#importPrefecture"),
  mergeDuplicates: document.querySelector("#mergeDuplicates"),
  importPreview: document.querySelector("#importPreview"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  prefectureFilter: document.querySelector("#prefectureFilter"),
  assigneeFilter: document.querySelector("#assigneeFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  visibilityFilter: document.querySelector("#visibilityFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  venueTableBody: document.querySelector("#venueTableBody"),
  visibleCount: document.querySelector("#visibleCount"),
  pinnedColumnControls: document.querySelector("#pinnedColumnControls"),
  visibleColumnControls: document.querySelector("#visibleColumnControls"),
  columnPresetControls: document.querySelector("#columnPresetControls"),
  saveStatus: document.querySelector("#saveStatus"),
  undoChangeButton: document.querySelector("#undoChangeButton"),
  emptyState: document.querySelector("#emptyState"),
  detailTitle: document.querySelector("#detailTitle"),
  detailStatus: document.querySelector("#detailStatus"),
  detailContent: document.querySelector("#detailContent"),
  newVenueButton: document.querySelector("#newVenueButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  logoutButton: document.querySelector("#logoutButton"),
  currentUserSelect: document.querySelector("#currentUserSelect"),
  currentUserRole: document.querySelector("#currentUserRole"),
  userAdminTools: document.querySelector("#userAdminTools"),
  userForm: document.querySelector("#userForm"),
  userList: document.querySelector("#userList"),
  statusForm: document.querySelector("#statusForm"),
  statusList: document.querySelector("#statusList"),
  temperatureList: document.querySelector("#temperatureList"),
  topAlertCount: document.querySelector("#topAlertCount"),
  topAlertCountNumber: document.querySelector("#topAlertCountNumber"),
  alertDialog: document.querySelector("#alertDialog"),
  alertDialogCount: document.querySelector("#alertDialogCount"),
  alertDialogLead: document.querySelector("#alertDialogLead"),
  alertVenueList: document.querySelector("#alertVenueList"),
  closeAlertDialogButton: document.querySelector("#closeAlertDialogButton"),
  closeAlertListButton: document.querySelector("#closeAlertListButton"),
  enableNotificationsButton: document.querySelector("#enableNotificationsButton"),
  notificationLeadDays: document.querySelector("#notificationLeadDays"),
  notificationPopupLeadDays: document.querySelector("#notificationPopupLeadDays"),
  notificationDisplayMode: document.querySelector("#notificationDisplayMode"),
  notificationScope: document.querySelector("#notificationScope"),
  notificationDismissCondition: document.querySelector("#notificationDismissCondition"),
  notificationStatus: document.querySelector("#notificationStatus"),
  notificationHelp: document.querySelector("#notificationHelp"),
  notificationBadge: document.querySelector("#notificationBadge"),
  upcomingCalls: document.querySelector("#upcomingCalls"),
  callWorkList: document.querySelector("#callWorkList"),
  callWorkCount: document.querySelector("#callWorkCount"),
  adminHistoryLink: document.querySelector("#adminHistoryLink"),
  historyAccessDenied: document.querySelector("#historyAccessDenied"),
  historyContent: document.querySelector("#historyContent"),
  historyMetricTotal: document.querySelector("#historyMetricTotal"),
  historyMetricToday: document.querySelector("#historyMetricToday"),
  historyMetricVenues: document.querySelector("#historyMetricVenues"),
  historyMetricCallers: document.querySelector("#historyMetricCallers"),
  historyImportantOnly: document.querySelector("#historyImportantOnly"),
  historyTableBody: document.querySelector("#historyTableBody"),
  callerSummary: document.querySelector("#callerSummary"),
  statusSummary: document.querySelector("#statusSummary"),
  notesDialog: document.querySelector("#notesDialog"),
  notesForm: document.querySelector("#notesForm"),
  notesTitle: document.querySelector("#notesTitle"),
  notesTextarea: document.querySelector("#notesTextarea"),
  notesImportantInput: document.querySelector("#notesImportantInput"),
  closeNotesDialogButton: document.querySelector("#closeNotesDialogButton"),
  cancelNotesButton: document.querySelector("#cancelNotesButton"),
  venueDialog: document.querySelector("#venueDialog"),
  venueForm: document.querySelector("#venueForm"),
  formTitle: document.querySelector("#formTitle"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelFormButton: document.querySelector("#cancelFormButton"),
  deleteVenueButton: document.querySelector("#deleteVenueButton"),
};

init();

async function init() {
  if (!(await requireAuthenticatedUser())) return;
  await initializeRemoteData();
  ensureVenueMetadata();
  ensureColumnSchema();
  setupTabs();
  populateStaticFilters();
  bindEvents();
  render();
  startNotificationChecks();
}

function bindEvents() {
  on(elements.searchInput, "input", render);
  on(elements.statusFilter, "change", render);
  on(elements.prefectureFilter, "change", render);
  on(elements.assigneeFilter, "change", render);
  on(elements.priorityFilter, "change", render);
  on(elements.visibilityFilter, "change", render);
  on(elements.sortSelect, "change", render);
  on(elements.csvFile, "change", handleCsvSelection);
  on(elements.importPrefecture, "change", handleImportPrefectureChange);
  on(elements.newVenueButton, "click", () => openForm());
  on(elements.exportCsvButton, "click", exportCsv);
  on(elements.logoutButton, "click", logoutCurrentUser);
  on(elements.currentUserSelect, "change", changeCurrentUser);
  on(elements.userForm, "submit", createUser);
  on(elements.statusForm, "submit", createStatusOption);
  on(elements.undoChangeButton, "click", undoLastChange);
  on(elements.topAlertCount, "click", openAlertDialog);
  on(elements.closeAlertDialogButton, "click", closeAlertDialog);
  on(elements.closeAlertListButton, "click", closeAlertDialog);
  on(elements.enableNotificationsButton, "click", enableNotifications);
  on(elements.notificationLeadDays, "change", updateNotificationSettings);
  on(elements.notificationPopupLeadDays, "change", updateNotificationSettings);
  on(elements.notificationDisplayMode, "change", updateNotificationSettings);
  on(elements.notificationScope, "change", updateNotificationSettings);
  on(elements.notificationDismissCondition, "change", updateNotificationSettings);
  on(elements.closeDialogButton, "click", closeForm);
  on(elements.cancelFormButton, "click", closeForm);
  on(elements.deleteVenueButton, "click", deleteSelectedVenue);
  on(elements.venueForm, "submit", saveVenueFromForm);
  on(elements.closeNotesDialogButton, "click", closeNotesDialog);
  on(elements.cancelNotesButton, "click", closeNotesDialog);
  on(elements.notesForm, "submit", saveNotesFromForm);
  on(elements.historyImportantOnly, "change", renderHistoryPage);
}

function setupTabs() {
  on(elements.managementSectionSelect, "change", () => activateTab(elements.managementSectionSelect.value));
  if (elements.managementSectionSelect) {
    activateTab(elements.managementSectionSelect.value || "callTab");
  }

  const buttons = [...document.querySelectorAll("[data-tab-target]")];
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tabTarget));
  });
}

function activateTab(targetId) {
  const targetPanel = targetId ? document.getElementById(targetId) : null;
  if (targetPanel?.hasAttribute("data-admin-only-section") && !canManageUsers()) {
    targetId = "userTab";
  }

  if (elements.managementSectionSelect && elements.managementSectionSelect.value !== targetId) {
    elements.managementSectionSelect.value = targetId;
  }

  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    const selected = button.dataset.tabTarget === targetId;
    button.classList.toggle("is-active", selected);
    button.setAttribute("aria-selected", String(selected));
  });

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    const selected = panel.id === targetId;
    panel.classList.toggle("is-active", selected);
    panel.hidden = !selected;
  });
}

function on(element, eventName, handler) {
  if (element) element.addEventListener(eventName, handler);
}

async function requireAuthenticatedUser() {
  if (isSupabaseEnabled()) {
    try {
      const profile = await window.crmSupabase.getCurrentProfile();
      if (profile?.active) {
        currentUserId = profile.id;
        users = [profile, ...users.filter((user) => user.id !== profile.id)];
        saveCurrentUserId();
        return true;
      }
    } catch (error) {
      console.error("Supabase auth check failed", error);
    }
    const pageName = getCurrentPageName();
    const next = encodeURIComponent(`${pageName}${window.location.search || ""}${window.location.hash || ""}`);
    window.location.href = `./login.html?next=${next}`;
    return false;
  }

  const session = readJsonStorage(AUTH_SESSION_KEY, null);
  const sessionUser = users.find((user) => user.id === session?.userId && user.active !== false);
  if (sessionUser) {
    currentUserId = sessionUser.id;
    saveCurrentUserId();
    return true;
  }

  const pageName = getCurrentPageName();
  const next = encodeURIComponent(`${pageName}${window.location.search || ""}${window.location.hash || ""}`);
  window.location.href = `./login.html?next=${next}`;
  return false;
}

async function logoutCurrentUser() {
  if (isSupabaseEnabled()) {
    try {
      await window.crmSupabase.signOut();
    } catch (error) {
      console.error("Supabase sign out failed", error);
    }
  }
  window.localStorage.removeItem(AUTH_SESSION_KEY);
  const pageName = getCurrentPageName();
  const next = encodeURIComponent(`${pageName}${window.location.search || ""}${window.location.hash || ""}`);
  window.location.href = `./login.html?next=${next}`;
}

function getCurrentPageName() {
  return window.location.pathname.split("/").pop() || "index.html";
}

function isSupabaseEnabled() {
  return Boolean(window.crmSupabase?.isEnabled?.());
}

function isRemoteDataMode() {
  return remoteDataReady && isSupabaseEnabled();
}

async function initializeRemoteData() {
  if (!isSupabaseEnabled()) return;

  markSaved("Supabase同期中...");
  try {
    const workspace = await window.crmSupabase.loadWorkspace(currentUserId);
    const currentUser = workspace.currentUser || users.find((user) => user.id === currentUserId);

    users = workspace.users.length ? workspace.users.map(normalizeUserAccount) : users;
    if (currentUser?.id) currentUserId = currentUser.id;
    saveCurrentUserId();

    statusOptions = normalizeStatusOptions(workspace.statusOptions.length ? workspace.statusOptions : defaultStatuses);
    statusMeta = normalizeStatusMeta({
      ...defaultStatusMeta,
      ...workspace.statusMeta,
    });
    temperatureMeta = normalizeTemperatureMeta({
      ...defaultTemperatureMeta,
      ...workspace.temperatureMeta,
    });
    venues = workspace.venues;
    callHistory = workspace.callHistory;

    const preferences = workspace.preferences || {};
    columnOrders = {
      ...columnOrders,
      [currentUserId]: Array.isArray(preferences.columnOrder) ? preferences.columnOrder : columnOrders[currentUserId] || [],
    };
    pinnedColumns = {
      ...pinnedColumns,
      [currentUserId]: Array.isArray(preferences.pinnedColumns) ? preferences.pinnedColumns : pinnedColumns[currentUserId] || [],
    };
    visibleColumns = {
      ...visibleColumns,
      [currentUserId]: Array.isArray(preferences.visibleColumns) ? preferences.visibleColumns : visibleColumns[currentUserId] || [],
    };
    notificationSettings = normalizeNotificationSettings(preferences.notificationSettings || notificationSettings, currentUserId);
    selectedId = getInitialSelectedId();
    remoteDataReady = true;
    cacheCurrentDataLocally();
    markSaved("Supabase同期済み");
  } catch (error) {
    remoteDataReady = false;
    console.error("Supabase workspace load failed", error);
    notifyMessage(`Supabase同期に失敗しました: ${error.message || "設定を確認してください。"}`);
    markSaved("Supabase同期エラー");
  }
}

function cacheCurrentDataLocally() {
  writeJsonStorage(USERS_KEY, users);
  writeJsonStorage(STORAGE_KEY, venues);
  writeJsonStorage(CALL_HISTORY_KEY, callHistory);
  writeJsonStorage(STATUS_OPTIONS_KEY, statusOptions);
  writeJsonStorage(STATUS_META_KEY, statusMeta);
  writeJsonStorage(TEMPERATURE_META_KEY, temperatureMeta);
  writeJsonStorage(COLUMN_ORDER_KEY, columnOrders);
  writeJsonStorage(PINNED_COLUMNS_KEY, pinnedColumns);
  writeJsonStorage(VISIBLE_COLUMNS_KEY, visibleColumns);
  writeJsonStorage(getNotificationSettingsStorageKey(), notificationSettings);
}

function updateManagementMenuAccess() {
  if (!elements.managementSectionSelect) return;
  const isAdmin = canManageUsers();

  [...elements.managementSectionSelect.options].forEach((option) => {
    if (option.hasAttribute("data-admin-only")) {
      option.disabled = !isAdmin;
    }
  });

  const currentPanel = document.getElementById(elements.managementSectionSelect.value);
  if (!isAdmin && currentPanel?.hasAttribute("data-admin-only-section")) {
    activateTab("userTab");
  }
}

function populateStaticFilters() {
  if (elements.statusFilter) {
    const current = elements.statusFilter.value;
    elements.statusFilter.replaceChildren(new Option("すべて", ""));
    statusOptions.forEach((status) => {
      elements.statusFilter.append(new Option(status, status));
    });
    elements.statusFilter.value = statusOptions.includes(current) ? current : "";
  }

  if (elements.priorityFilter) {
    const current = elements.priorityFilter.value;
    elements.priorityFilter.replaceChildren(new Option("すべて", ""));
    priorities.forEach((priority) => {
      elements.priorityFilter.append(new Option(temperatureOptionText(priority), priority));
    });
    elements.priorityFilter.value = priorities.includes(current) ? current : "";
  }

  if (elements.assigneeFilter) {
    const current = elements.assigneeFilter.value;
    elements.assigneeFilter.replaceChildren(new Option("すべて", ""));
    elements.assigneeFilter.append(new Option("自分の担当のみ", "__current"));
    elements.assigneeFilter.append(new Option("未割当", "__unassigned"));
    users
      .filter((user) => user.active !== false || venues.some((venue) => venue.assignedUserId === user.id))
      .forEach((user) => {
        elements.assigneeFilter.append(new Option(user.name, user.id));
      });
    const validValues = ["", "__current", "__unassigned", ...users.map((user) => user.id)];
    elements.assigneeFilter.value = validValues.includes(current) ? current : "";
  }

  populateImportPrefectureOptions();
  refreshStatusFormOptions();
  refreshTemperatureFormOptions();
}

function populateImportPrefectureOptions() {
  if (!elements.importPrefecture) return;
  const current = elements.importPrefecture.value;
  elements.importPrefecture.replaceChildren(new Option("CSV/自動判定", ""));
  japanPrefectures.forEach((prefecture) => {
    elements.importPrefecture.append(new Option(prefecture, prefecture));
  });
  elements.importPrefecture.value = japanPrefectures.includes(current) ? current : "";
}

function loadUsers() {
  const saved = readJsonStorage(USERS_KEY, null);
  const source = Array.isArray(saved) && saved.length ? saved : seedUsers;
  const normalizedUsers = source.map(normalizeUserAccount);
  if (!Array.isArray(saved) || JSON.stringify(saved) !== JSON.stringify(normalizedUsers)) {
    writeJsonStorage(USERS_KEY, normalizedUsers);
  }
  return normalizedUsers;
}

function normalizeUserAccount(user) {
  const loginId = normalizeLoginId(user.loginId || defaultLoginIdForEmail(user.email) || user.email || user.name);
  return {
    ...user,
    id: user.id || makeId(),
    name: String(user.name || "").trim() || "未設定ユーザー",
    loginId,
    email: String(user.email || "").trim(),
    role: roleLabels[user.role] ? user.role : "staff",
    active: user.active !== false,
    authPassword: String(user.authPassword || "password"),
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
}

function loadCurrentUserId() {
  const saved = readJsonStorage(CURRENT_USER_KEY, "");
  const activeUsers = users.filter((user) => user.active !== false);
  const fallback = activeUsers[0]?.id ?? users[0]?.id ?? "";
  const nextId = users.some((user) => user.id === saved && user.active !== false) ? saved : fallback;
  writeJsonStorage(CURRENT_USER_KEY, nextId);
  return nextId;
}

function saveCurrentUserId() {
  writeJsonStorage(CURRENT_USER_KEY, currentUserId);
}

function loadVenues() {
  const saved = readJsonStorage(STORAGE_KEY, null);
  if (!Array.isArray(saved)) {
    writeJsonStorage(STORAGE_KEY, seedVenues);
    return seedVenues;
  }
  return saved;
}

function saveVenues(changedVenueIds = null) {
  writeJsonStorage(STORAGE_KEY, venues);
  queueRemoteVenueSave(changedVenueIds);
}

function getNotificationSettingsStorageKey(userId = currentUserId) {
  return `${NOTIFICATION_SETTINGS_KEY}.${userId || "default"}`;
}

function normalizeNotificationSettings(saved, userId = currentUserId) {
  const defaultScope = getDefaultNotificationScope(userId);
  return {
    ...defaultNotificationSettings,
    ...(saved && typeof saved === "object" ? saved : {}),
    scope: normalizeNotificationScope(saved?.scope ?? defaultScope),
    notified: saved?.notified && typeof saved.notified === "object" ? saved.notified : {},
    dismissed: saved?.dismissed && typeof saved.dismissed === "object" ? saved.dismissed : {},
  };
}

function loadNotificationSettings(userId = currentUserId) {
  const saved = readJsonStorage(getNotificationSettingsStorageKey(userId), null);
  if (saved && typeof saved === "object" && !Array.isArray(saved)) {
    return normalizeNotificationSettings(saved, userId);
  }

  return normalizeNotificationSettings(readJsonStorage(NOTIFICATION_SETTINGS_KEY, null), userId);
}

function saveNotificationSettings(userId = currentUserId) {
  writeJsonStorage(getNotificationSettingsStorageKey(userId), notificationSettings);
  queueRemotePreferenceSave(userId);
}

function loadCallHistory() {
  const saved = readJsonStorage(CALL_HISTORY_KEY, []);
  return Array.isArray(saved) ? saved : [];
}

function saveCallHistory() {
  writeJsonStorage(CALL_HISTORY_KEY, callHistory);
}

function loadStatusOptions() {
  const saved = readJsonStorage(STATUS_OPTIONS_KEY, null);
  if (!Array.isArray(saved)) {
    writeJsonStorage(STATUS_OPTIONS_KEY, defaultStatuses);
    return defaultStatuses;
  }
  const normalized = normalizeStatusOptions(saved);
  return normalized.length ? normalized : defaultStatuses;
}

function saveStatusOptions() {
  writeJsonStorage(STATUS_OPTIONS_KEY, statusOptions);
  queueRemoteStatusOptionsSave();
}

function loadColumnOrders() {
  const saved = readJsonStorage(COLUMN_ORDER_KEY, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function saveColumnOrders() {
  writeJsonStorage(COLUMN_ORDER_KEY, columnOrders);
  queueRemotePreferenceSave();
}

function loadPinnedColumns() {
  const saved = readJsonStorage(PINNED_COLUMNS_KEY, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function savePinnedColumns() {
  writeJsonStorage(PINNED_COLUMNS_KEY, pinnedColumns);
  queueRemotePreferenceSave();
}

function loadVisibleColumns() {
  const saved = readJsonStorage(VISIBLE_COLUMNS_KEY, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
}

function saveVisibleColumns() {
  writeJsonStorage(VISIBLE_COLUMNS_KEY, visibleColumns);
  queueRemotePreferenceSave();
}

function ensureColumnSchema() {
  const currentVersion = Number(readJsonStorage(COLUMN_SCHEMA_VERSION_KEY, 1));
  if (currentVersion >= COLUMN_SCHEMA_VERSION) return;

  let visibleChanged = false;
  let orderChanged = false;
  let pinnedChanged = false;
  let nextVisibleColumns = { ...visibleColumns };
  let nextColumnOrders = { ...columnOrders };
  let nextPinnedColumns = { ...pinnedColumns };

  if (currentVersion < 2) {
    Object.entries(nextVisibleColumns).forEach(([userId, columnIds]) => {
      if (!Array.isArray(columnIds) || columnIds.includes("notificationLeadDays")) return;
      nextVisibleColumns[userId] = insertAfterColumn(columnIds, "notificationLeadDays", "notification");
      visibleChanged = true;
    });
  }

  if (currentVersion < 3) {
    Object.entries(nextVisibleColumns).forEach(([userId, columnIds]) => {
      const migrated = migrateTemperatureColumnIds(columnIds);
      if (migrated !== columnIds) {
        nextVisibleColumns[userId] = migrated;
        visibleChanged = true;
      }
    });
    Object.entries(nextColumnOrders).forEach(([userId, columnIds]) => {
      const migrated = migrateTemperatureColumnIds(columnIds);
      if (migrated !== columnIds) {
        nextColumnOrders[userId] = migrated;
        orderChanged = true;
      }
    });
    Object.entries(nextPinnedColumns).forEach(([userId, columnIds]) => {
      const migrated = migrateTemperatureColumnIds(columnIds);
      if (migrated !== columnIds) {
        nextPinnedColumns[userId] = migrated;
        pinnedChanged = true;
      }
    });
  }

  if (visibleChanged) {
    visibleColumns = nextVisibleColumns;
    saveVisibleColumns();
  }
  if (orderChanged) {
    columnOrders = nextColumnOrders;
    saveColumnOrders();
  }
  if (pinnedChanged) {
    pinnedColumns = nextPinnedColumns;
    savePinnedColumns();
  }
  writeJsonStorage(COLUMN_SCHEMA_VERSION_KEY, COLUMN_SCHEMA_VERSION);
}

function insertAfterColumn(columnIds, columnId, afterColumnId) {
  const columns = columnIds.filter((id) => id !== columnId);
  const afterIndex = columns.indexOf(afterColumnId);
  if (afterIndex < 0) return [...columns, columnId];
  return [...columns.slice(0, afterIndex + 1), columnId, ...columns.slice(afterIndex + 1)];
}

function migrateTemperatureColumnIds(columnIds) {
  if (!Array.isArray(columnIds)) return columnIds;
  const migrated = unique(columnIds.map((columnId) => (columnId === "rating" ? "priority" : columnId)));
  return migrated.join("\u0000") === columnIds.join("\u0000") ? columnIds : migrated;
}

function loadStatusMeta() {
  const saved = readJsonStorage(STATUS_META_KEY, {});
  return normalizeStatusMeta({
    ...defaultStatusMeta,
    ...(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {}),
  });
}

function saveStatusMeta() {
  writeJsonStorage(STATUS_META_KEY, statusMeta);
  queueRemoteStatusOptionsSave();
}

function loadTemperatureMeta() {
  const saved = readJsonStorage(TEMPERATURE_META_KEY, {});
  return normalizeTemperatureMeta(saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {});
}

function saveTemperatureMeta() {
  writeJsonStorage(TEMPERATURE_META_KEY, temperatureMeta);
  queueRemoteTemperatureOptionsSave();
}

function readJsonStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn("Local storage is unavailable. Data will be kept only while this page is open.");
  }
}

function queueRemoteVenueSave(changedVenueIds = null) {
  if (!isRemoteDataMode()) return;
  const targetIds = Array.isArray(changedVenueIds) ? new Set(changedVenueIds) : null;
  const targetVenues = targetIds ? venues.filter((venue) => targetIds.has(venue.id)) : venues;
  if (!targetVenues.length) return;

  markSaved("Supabase保存中...");
  window.crmSupabase
    .upsertVenues(targetVenues, currentUserId)
    .then(() => markSaved("Supabase保存済み"))
    .catch((error) => handleRemoteSaveError(error));
}

function queueRemoteVenueDelete(id) {
  if (!isRemoteDataMode() || !id) return;
  markSaved("Supabase削除中...");
  window.crmSupabase
    .deleteVenue(id)
    .then(() => markSaved("Supabase削除済み"))
    .catch((error) => handleRemoteSaveError(error));
}

function queueRemoteCallHistorySave(entries) {
  if (!isRemoteDataMode()) return;
  window.crmSupabase.insertCallHistories(entries).catch((error) => handleRemoteSaveError(error, false));
}

function queueRemotePreferenceSave(userId = currentUserId) {
  if (!isRemoteDataMode() || !userId) return;
  window.crmSupabase
    .saveUserPreferences(userId, {
      columnOrder: columnOrders[userId] || [],
      pinnedColumns: pinnedColumns[userId] || [],
      visibleColumns: visibleColumns[userId] || [],
      notificationSettings,
    })
    .catch((error) => handleRemoteSaveError(error, false));
}

function queueRemoteProfileUpdate(id, updates) {
  if (!isRemoteDataMode() || !id) return;
  markSaved("Supabase保存中...");
  window.crmSupabase
    .updateProfile(id, updates)
    .then(() => markSaved("Supabase保存済み"))
    .catch((error) => handleRemoteSaveError(error));
}

function queueRemoteProfileDelete(id) {
  if (!isRemoteDataMode() || !id || !window.crmSupabase?.deleteProfile) return;
  markSaved("Supabase削除中...");
  window.crmSupabase
    .deleteProfile(id)
    .then(() => markSaved("Supabase削除済み"))
    .catch((error) => handleRemoteSaveError(error));
}

function queueRemoteStatusOptionsSave() {
  if (!isRemoteDataMode()) return;
  window.crmSupabase.upsertStatusOptions(statusOptions, statusMeta).catch((error) => handleRemoteSaveError(error, false));
}

function queueRemoteStatusOptionDelete(status) {
  if (!isRemoteDataMode() || !status) return;
  window.crmSupabase.deleteStatusOption(status).catch((error) => handleRemoteSaveError(error, false));
}

function queueRemoteTemperatureOptionsSave() {
  if (!isRemoteDataMode()) return;
  window.crmSupabase.upsertTemperatureOptions(temperatureMeta).catch((error) => handleRemoteSaveError(error, false));
}

function handleRemoteSaveError(error, showNotice = true) {
  console.error("Supabase save failed", error);
  markSaved("Supabase保存エラー");
  if (showNotice && !remoteSaveNoticeShown) {
    remoteSaveNoticeShown = true;
    notifyMessage(`Supabaseへの保存に失敗しました: ${error.message || "設定を確認してください。"}`);
    window.setTimeout(() => {
      remoteSaveNoticeShown = false;
    }, 5000);
  }
}

function cloneForUndo(value) {
  return JSON.parse(JSON.stringify(value));
}

function createUndoSnapshot(label = "変更") {
  return {
    label,
    venues: cloneForUndo(venues),
    selectedId,
    notificationSettings: cloneForUndo(notificationSettings),
    callHistory: cloneForUndo(callHistory),
  };
}

function setUndoSnapshot(snapshot) {
  lastUndoSnapshot = snapshot;
  if (!elements.undoChangeButton) return;
  elements.undoChangeButton.hidden = false;
  elements.undoChangeButton.title = `${snapshot.label}を元に戻します`;
}

function undoLastChange() {
  if (!lastUndoSnapshot) return;
  venues = cloneForUndo(lastUndoSnapshot.venues);
  selectedId = lastUndoSnapshot.selectedId;
  notificationSettings = cloneForUndo(lastUndoSnapshot.notificationSettings);
  callHistory = cloneForUndo(lastUndoSnapshot.callHistory);
  lastUndoSnapshot = null;
  saveVenues();
  saveNotificationSettings();
  saveCallHistory();
  if (elements.undoChangeButton) elements.undoChangeButton.hidden = true;
  markSaved("元に戻しました");
  render();
}

function markSaved(message = "保存済み") {
  if (!elements.saveStatus) return;
  elements.saveStatus.textContent = message;
  elements.saveStatus.classList.add("is-active");
  if (saveStatusTimer) window.clearTimeout(saveStatusTimer);
  saveStatusTimer = window.setTimeout(() => {
    if (!elements.saveStatus) return;
    elements.saveStatus.textContent = "保存済み";
    elements.saveStatus.classList.remove("is-active");
  }, 1800);
}

function getInitialSelectedId() {
  const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (hashId && venues.some((venue) => venue.id === hashId)) return hashId;
  return venues[0]?.id ?? null;
}

function ensureVenueMetadata() {
  let changed = false;
  venues = venues.map((venue) => {
    const nextVenue = {
      ...venue,
    };
    if (!nextVenue.assignedUserId || !users.some((user) => user.id === nextVenue.assignedUserId)) {
      nextVenue.assignedUserId = currentUserId;
      changed = true;
    }
    if (nextVenue.callUpdatedAt === undefined) {
      nextVenue.callUpdatedAt = nextVenue.lastContactDate ? normalizeDateTime(nextVenue.lastContactDate) : "";
      changed = true;
    }
    if (nextVenue.callUpdatedByUserId === undefined) {
      nextVenue.callUpdatedByUserId = nextVenue.callUpdatedAt ? currentUserId : "";
      changed = true;
    }
    const normalizedPrefecture = getVenuePrefecture(nextVenue);
    if (normalizedPrefecture && nextVenue.prefecture !== normalizedPrefecture) {
      nextVenue.prefecture = normalizedPrefecture;
      changed = true;
    }
    const normalizedTemperature = normalizeTemperatureValue(nextVenue.priority || nextVenue.rating);
    if (nextVenue.priority !== normalizedTemperature) {
      nextVenue.priority = normalizedTemperature;
      changed = true;
    }
    if (nextVenue.rating !== normalizedTemperature) {
      nextVenue.rating = normalizedTemperature;
      changed = true;
    }
    const normalizedProgramPolicy = normalizeVenueField("programPolicy", nextVenue.programPolicy);
    if (nextVenue.programPolicy !== normalizedProgramPolicy) {
      nextVenue.programPolicy = normalizedProgramPolicy;
      changed = true;
    }
    if (nextVenue.considerationDate === undefined) {
      nextVenue.considerationDate = "";
      changed = true;
    }
    if (nextVenue.notificationLeadDays === undefined) {
      nextVenue.notificationLeadDays = "";
      changed = true;
    } else {
      const normalizedNotificationLeadDays = normalizeVenueField("notificationLeadDays", nextVenue.notificationLeadDays);
      if (nextVenue.notificationLeadDays !== normalizedNotificationLeadDays) {
        nextVenue.notificationLeadDays = normalizedNotificationLeadDays;
        changed = true;
      }
    }
    if (nextVenue.notesImportant === undefined) {
      nextVenue.notesImportant = false;
      changed = true;
    } else {
      const normalizedNotesImportant = parseImportantNoteValue(nextVenue.notesImportant);
      if (nextVenue.notesImportant !== normalizedNotesImportant) {
        nextVenue.notesImportant = normalizedNotesImportant;
        changed = true;
      }
    }
    if (nextVenue.isHidden === undefined) {
      nextVenue.isHidden = false;
      changed = true;
    }
    if (nextVenue.largeHallSeats === undefined) {
      nextVenue.largeHallSeats = nextVenue.seatCount || "";
      changed = true;
    }
    if (nextVenue.mediumHallSeats === undefined) {
      nextVenue.mediumHallSeats = "";
      changed = true;
    }
    if (nextVenue.smallHallSeats === undefined) {
      nextVenue.smallHallSeats = "";
      changed = true;
    }
    const normalizedHallScale = normalizeHallScaleValues(nextVenue);
    ["seatCount", "largeHallSeats", "mediumHallSeats", "smallHallSeats"].forEach((field) => {
      if (String(nextVenue[field] ?? "") !== String(normalizedHallScale[field] ?? "")) {
        nextVenue[field] = normalizedHallScale[field] ?? "";
        changed = true;
      }
    });
    return nextVenue;
  });
  if (changed) saveVenues();
}

function render() {
  populateStaticFilters();
  renderUserPanel();
  refreshAssigneeOptions();
  refreshPrefectureFilter();
  const filtered = getFilteredVenues();
  renderMetrics();
  renderTable(filtered);
  renderDetail();
  renderNotificationPanel();
  renderCallWorkList();
  renderHistoryPage();
}

function renderMetrics() {
  const today = startOfDay(new Date());
  setText(elements.metricTotal, venues.length);
  setText(elements.metricTodo, venues.filter((venue) => venue.status === "未着手").length);
  setText(elements.metricProposal, venues.filter((venue) => ["提案中", "見積・調整中"].includes(venue.status)).length);
  setText(
    elements.metricDue,
    venues.filter((venue) => {
      if (!venue.nextActionDate || isClosedForCalls(venue) || isVenueHidden(venue)) return false;
      return startOfDay(new Date(venue.nextActionDate)) <= today;
    }).length
  );
}

function setText(element, value) {
  if (element) element.textContent = value;
}

function renderUserPanel() {
  const currentUser = getCurrentUser();

  if (elements.currentUserSelect) {
    const currentValue = currentUser?.id ?? "";
    const selectableUsers = users.filter((user) => user.active !== false || user.id === currentValue);
    elements.currentUserSelect.replaceChildren();
    selectableUsers.forEach((user) => {
      elements.currentUserSelect.append(new Option(`${user.name} (${roleLabels[user.role] || user.role})`, user.id));
    });
    elements.currentUserSelect.value = currentValue;
    elements.currentUserSelect.disabled = isSupabaseEnabled();
    elements.currentUserSelect.title = isSupabaseEnabled() ? "Supabaseログイン中はログインユーザーで固定されます" : "";
  }

  if (elements.currentUserRole) {
    elements.currentUserRole.textContent = roleLabels[currentUser?.role] || "未設定";
    elements.currentUserRole.className = `role-pill ${currentUser?.role === "admin" ? "admin" : "staff"}`;
  }

  if (elements.userAdminTools) {
    elements.userAdminTools.hidden = !canManageUsers();
  }

  if (elements.adminHistoryLink) {
    elements.adminHistoryLink.hidden = !canManageUsers();
  }

  updateManagementMenuAccess();
  renderUserList();
  renderStatusManager();
  renderTemperatureManager();
}

function renderUserList() {
  if (!elements.userList) return;

  elements.userList.innerHTML = users
    .map((user) => {
      const isCurrent = user.id === currentUserId;
      const disabled = isCurrent ? "disabled" : "";
      const stateLabel = user.active === false ? "復帰" : "停止";
      const stateClass = user.active === false ? "secondary-button" : "danger-button";
      const canDelete = user.active === false && !isCurrent;
      const deleteTitle = isCurrent ? "自分のアカウントは削除できません" : canDelete ? "削除" : "停止後に削除できます";
      return `
        <div class="user-row ${user.active === false ? "is-paused" : ""}">
          <div>
            <strong>${escapeHtml(user.name)}</strong>
            <span>ログインID: ${escapeHtml(user.loginId || "-")}</span>
          </div>
          <select data-user-role="${escapeAttribute(user.id)}" ${disabled}>
            <option value="staff" ${user.role === "staff" ? "selected" : ""}>スタッフ</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>管理</option>
          </select>
          <button class="${stateClass}" data-user-toggle="${escapeAttribute(user.id)}" type="button" ${disabled}>${stateLabel}</button>
          <button class="danger-button" data-user-delete="${escapeAttribute(user.id)}" type="button" ${canDelete ? "" : "disabled"} title="${escapeAttribute(deleteTitle)}">削除</button>
        </div>
      `;
    })
    .join("");

  elements.userList.querySelectorAll("[data-user-role]").forEach((select) => {
    select.addEventListener("change", () => updateUserRole(select.dataset.userRole, select.value));
  });

  elements.userList.querySelectorAll("[data-user-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleUserActive(button.dataset.userToggle));
  });

  elements.userList.querySelectorAll("[data-user-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteUser(button.dataset.userDelete));
  });
}

function changeCurrentUser() {
  saveNotificationSettings();
  currentUserId = elements.currentUserSelect.value;
  saveCurrentUserId();
  notificationSettings = loadNotificationSettings();
  render();
  checkCallNotifications(false);
}

async function createUser(event) {
  event.preventDefault();
  if (!canManageUsers()) return;

  const formData = new FormData(elements.userForm);
  const name = String(formData.get("userName") ?? "").trim();
  const loginId = normalizeLoginId(formData.get("userLoginId"));
  const password = String(formData.get("userPassword") ?? "").trim();

  if (!name || !loginId || password.length < 4) {
    notifyMessage("名前、ログインID、4文字以上のパスワードを入力してください。");
    return;
  }

  if (users.some((user) => normalizeLoginId(user.loginId || user.email) === loginId)) {
    notifyMessage("同じログインIDのユーザーがすでにあります。");
    return;
  }

  if (isSupabaseEnabled()) {
    try {
      markSaved("ユーザー作成中...");
      const createdUser = await window.crmSupabase.createUser({ name, loginId, password });
      users = [...users, normalizeUserAccount(createdUser)];
      elements.userForm.reset();
      markSaved("ユーザーを追加しました");
      render();
    } catch (error) {
      notifyMessage(`ユーザー作成に失敗しました: ${error.message || "Vercelの環境変数を確認してください。"}`);
      markSaved("ユーザー作成エラー");
    }
    return;
  }

  const now = new Date().toISOString();
  users = [
    ...users,
    {
      id: makeId(),
      name,
      loginId,
      email: "",
      role: "staff",
      authPassword: password,
      active: true,
      createdAt: now,
      updatedAt: now,
    },
  ];
  writeJsonStorage(USERS_KEY, users);
  elements.userForm.reset();
  render();
}

function updateUserRole(id, role) {
  if (!canManageUsers()) return;
  const now = new Date().toISOString();
  users = users.map((user) =>
    user.id === id
      ? {
          ...user,
          role: roleLabels[role] ? role : "staff",
          updatedAt: now,
        }
      : user
  );
  writeJsonStorage(USERS_KEY, users);
  queueRemoteProfileUpdate(id, { role: roleLabels[role] ? role : "staff" });
  render();
}

function toggleUserActive(id) {
  if (!canManageUsers() || id === currentUserId) return;
  const now = new Date().toISOString();
  users = users.map((user) =>
    user.id === id
      ? {
          ...user,
          active: user.active === false,
          updatedAt: now,
        }
      : user
  );
  writeJsonStorage(USERS_KEY, users);
  const updatedUser = users.find((user) => user.id === id);
  queueRemoteProfileUpdate(id, { active: updatedUser?.active !== false });
  render();
}

function deleteUser(id) {
  if (!canManageUsers() || id === currentUserId) return;
  const target = users.find((user) => user.id === id);
  if (!target) return;
  if (target.active !== false) {
    notifyMessage("ユーザーを削除するには、先に停止してください。");
    return;
  }

  const assignedCount = venues.filter((venue) => venue.assignedUserId === id).length;
  const confirmed = confirm(
    `${target.name || "このユーザー"}を削除しますか？${
      assignedCount ? `\n担当中の${assignedCount}件は未割当になります。` : ""
    }`
  );
  if (!confirmed) return;

  const now = new Date().toISOString();
  const changedVenueIds = [];
  venues = venues.map((venue) => {
    const nextVenue = { ...venue };
    let changed = false;
    ["assignedUserId", "callUpdatedByUserId", "createdBy", "updatedBy"].forEach((field) => {
      if (nextVenue[field] === id) {
        nextVenue[field] = "";
        changed = true;
      }
    });
    if (changed) {
      nextVenue.updatedAt = now;
      changedVenueIds.push(nextVenue.id);
    }
    return nextVenue;
  });

  const historyChanged = callHistory.some((entry) => entry.changedByUserId === id);
  if (historyChanged) {
    callHistory = callHistory.map((entry) => (entry.changedByUserId === id ? { ...entry, changedByUserId: "" } : entry));
    saveCallHistory();
  }

  users = users.filter((user) => user.id !== id);
  delete columnOrders[id];
  delete pinnedColumns[id];
  delete visibleColumns[id];
  window.localStorage.removeItem(getNotificationSettingsStorageKey(id));

  writeJsonStorage(USERS_KEY, users);
  writeJsonStorage(COLUMN_ORDER_KEY, columnOrders);
  writeJsonStorage(PINNED_COLUMNS_KEY, pinnedColumns);
  writeJsonStorage(VISIBLE_COLUMNS_KEY, visibleColumns);
  if (changedVenueIds.length) saveVenues(changedVenueIds);
  markSaved("ユーザーを削除しました");
  queueRemoteProfileDelete(id);
  render();
}

function renderStatusManager() {
  if (!elements.statusList) return;

  if (!canManageUsers()) {
    elements.statusList.replaceChildren();
    return;
  }

  elements.statusList.innerHTML = statusOptions
    .map((status) => {
      const usedCount = venues.filter((venue) => venue.status === status).length;
      const cannotDelete = usedCount > 0 || statusOptions.length <= 1;
      const deleteTitle = usedCount > 0 ? `${usedCount}件の施設で使用中です` : "削除";
      const meta = getStatusMeta(status);
      return `
        <div class="status-option-row">
          <input
            value="${escapeAttribute(status)}"
            data-status-input="${escapeAttribute(status)}"
            aria-label="${escapeAttribute(`${status}の名称`)}"
          />
          <label class="status-color-field" title="一覧で表示する色">
            <input
              type="color"
              value="${escapeAttribute(meta.color)}"
              data-status-color="${escapeAttribute(status)}"
              aria-label="${escapeAttribute(`${status}の色`)}"
            />
          </label>
          <label class="status-closed-line">
            <input
              type="checkbox"
              data-status-closed="${escapeAttribute(status)}"
              ${meta.isClosed ? "checked" : ""}
            />
            <span>架電対象外</span>
          </label>
          <span>${usedCount}件</span>
          <button class="secondary-button" data-status-save="${escapeAttribute(status)}" type="button">保存</button>
          <button class="danger-button" data-status-delete="${escapeAttribute(status)}" type="button" ${cannotDelete ? "disabled" : ""} title="${escapeAttribute(deleteTitle)}">削除</button>
        </div>
      `;
    })
    .join("");

  elements.statusList.querySelectorAll("[data-status-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".status-option-row");
      const input = row?.querySelector("[data-status-input]");
      const colorInput = row?.querySelector("[data-status-color]");
      const closedInput = row?.querySelector("[data-status-closed]");
      renameStatusOption(button.dataset.statusSave, input?.value ?? "", {
        color: colorInput?.value,
        isClosed: Boolean(closedInput?.checked),
      });
    });
  });

  elements.statusList.querySelectorAll("[data-status-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteStatusOption(button.dataset.statusDelete));
  });
}

function renderTemperatureManager() {
  if (!elements.temperatureList) return;

  if (!canManageUsers()) {
    elements.temperatureList.replaceChildren();
    return;
  }

  elements.temperatureList.innerHTML = priorities
    .map((level) => {
      const meta = getTemperatureMeta(level);
      const usedCount = venues.filter((venue) => venue.priority === level).length;
      return `
        <div class="temperature-option-row">
          <strong>${escapeHtml(level)}</strong>
          <input
            value="${escapeAttribute(meta.label)}"
            data-temperature-label="${escapeAttribute(level)}"
            maxlength="18"
            aria-label="${escapeAttribute(`${level}の名称`)}"
          />
          <label class="status-color-field" title="一覧で表示する色">
            <input
              type="color"
              value="${escapeAttribute(meta.color)}"
              data-temperature-color="${escapeAttribute(level)}"
              aria-label="${escapeAttribute(`${level}の色`)}"
            />
          </label>
          <span>${usedCount}件</span>
          <button class="secondary-button" data-temperature-save="${escapeAttribute(level)}" type="button">保存</button>
        </div>
      `;
    })
    .join("");

  elements.temperatureList.querySelectorAll("[data-temperature-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest(".temperature-option-row");
      const level = button.dataset.temperatureSave;
      const labelInput = row?.querySelector("[data-temperature-label]");
      const colorInput = row?.querySelector("[data-temperature-color]");
      saveTemperatureOption(level, labelInput?.value ?? "", colorInput?.value ?? "");
    });
  });
}

function createStatusOption(event) {
  event.preventDefault();
  if (!canManageUsers()) return;
  const input = elements.statusForm?.elements.statusName;
  const colorInput = elements.statusForm?.elements.statusColor;
  const closedInput = elements.statusForm?.elements.statusClosed;
  const nextStatus = normalizeStatusLabel(input?.value ?? "");
  if (!nextStatus) {
    notifyMessage("状態名を入力してください。");
    return;
  }
  if (statusOptions.includes(nextStatus)) {
    notifyMessage("同じ状態名がすでにあります。");
    return;
  }

  statusOptions = [...statusOptions, nextStatus];
  statusMeta = {
    ...statusMeta,
    [nextStatus]: {
      color: normalizeHexColor(colorInput?.value || "#3d7a52"),
      isClosed: Boolean(closedInput?.checked),
    },
  };
  saveStatusOptions();
  saveStatusMeta();
  if (input) input.value = "";
  if (colorInput) colorInput.value = "#3d7a52";
  if (closedInput) closedInput.checked = false;
  markSaved("状態を追加しました");
  render();
}

function renameStatusOption(previousStatus, nextValue, metaUpdates = {}) {
  if (!canManageUsers()) return;
  const nextStatus = normalizeStatusLabel(nextValue);
  if (!nextStatus) {
    notifyMessage("状態名を入力してください。");
    return;
  }
  if (nextStatus !== previousStatus && statusOptions.includes(nextStatus)) {
    notifyMessage("同じ状態名がすでにあります。");
    return;
  }

  const previousMeta = getStatusMeta(previousStatus);
  const nextMeta = {
    color: normalizeHexColor(metaUpdates.color || previousMeta.color),
    isClosed: Boolean(metaUpdates.isClosed),
  };
  const renamed = nextStatus !== previousStatus;

  if (renamed) {
    statusOptions = statusOptions.map((status) => (status === previousStatus ? nextStatus : status));
    venues = venues.map((venue) => (venue.status === previousStatus ? { ...venue, status: nextStatus } : venue));
    if (elements.statusFilter?.value === previousStatus) elements.statusFilter.value = nextStatus;
    delete statusMeta[previousStatus];
  }

  statusMeta = {
    ...statusMeta,
    [nextStatus]: nextMeta,
  };
  saveStatusOptions();
  saveStatusMeta();
  if (renamed) queueRemoteStatusOptionDelete(previousStatus);
  if (renamed) saveVenues();
  markSaved("状態設定を保存しました");
  render();
}

function deleteStatusOption(status) {
  if (!canManageUsers()) return;
  const usedCount = venues.filter((venue) => venue.status === status).length;
  if (usedCount > 0) {
    notifyMessage("使用中の状態は削除できません。名称変更で対応してください。");
    return;
  }
  if (statusOptions.length <= 1) {
    notifyMessage("状態は最低1件必要です。");
    return;
  }

  statusOptions = statusOptions.filter((item) => item !== status);
  const nextMeta = { ...statusMeta };
  delete nextMeta[status];
  statusMeta = nextMeta;
  saveStatusOptions();
  saveStatusMeta();
  queueRemoteStatusOptionDelete(status);
  markSaved("状態を削除しました");
  render();
}

function refreshAssigneeOptions(selectedValue = "") {
  const select = elements.venueForm?.elements?.assignedUserId;
  if (!select) return;

  const currentValue = selectedValue || select.value || currentUserId;
  const assignableUsers = users.filter((user) => user.active !== false || user.id === currentValue);
  select.replaceChildren(new Option("未割当", ""));
  assignableUsers.forEach((user) => {
    select.append(new Option(`${user.name} (${roleLabels[user.role] || user.role})`, user.id));
  });
  select.value = assignableUsers.some((user) => user.id === currentValue) ? currentValue : "";
}

function refreshStatusFormOptions(selectedValue = "") {
  const select = elements.venueForm?.elements?.status;
  if (!select) return;

  const currentValue = selectedValue || select.value || statusOptions[0] || "未着手";
  select.replaceChildren();
  statusOptions.forEach((status) => {
    select.append(new Option(status, status));
  });
  select.value = statusOptions.includes(currentValue) ? currentValue : statusOptions[0] || "";
}

function refreshTemperatureFormOptions(selectedValue = "") {
  const select = elements.venueForm?.elements?.priority;
  if (!select) return;

  const currentValue = selectedValue || select.value || "B";
  select.replaceChildren();
  priorities.forEach((level) => {
    select.append(new Option(temperatureOptionText(level), level));
  });
  select.value = priorities.includes(currentValue) ? currentValue : "B";
}

function getCurrentUser() {
  return users.find((user) => user.id === currentUserId) ?? users.find((user) => user.active !== false) ?? users[0] ?? null;
}

function canManageUsers() {
  return getCurrentUser()?.role === "admin";
}

function normalizeStatusLabel(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 24);
}

function normalizeLoginId(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

function defaultLoginIdForEmail(value = "") {
  const email = String(value ?? "").trim().toLowerCase();
  if (email === "admin@example.jp") return "admin";
  if (email === "staff@example.jp") return "staff";
  return "";
}

function normalizeStatusOptions(options) {
  return unique(options.map(normalizeStatusLabel).filter(Boolean));
}

function normalizeStatusMeta(source = {}) {
  const statusNames = unique([
    ...defaultStatuses,
    ...(Array.isArray(statusOptions) ? statusOptions : []),
    ...Object.keys(source),
  ]).map(normalizeStatusLabel).filter(Boolean);

  return Object.fromEntries(
    statusNames.map((status) => {
      const current = source[status] && typeof source[status] === "object" ? source[status] : {};
      return [
        status,
        {
          color: normalizeHexColor(current.color || defaultStatusMeta[status]?.color || "#3d7a52"),
          isClosed: Boolean(current.isClosed ?? defaultStatusMeta[status]?.isClosed ?? inferClosedStatus(status)),
        },
      ];
    })
  );
}

function getStatusMeta(status = "") {
  const statusName = normalizeStatusLabel(status) || statusOptions[0] || "未着手";
  return (
    statusMeta[statusName] || {
      color: normalizeHexColor(defaultStatusMeta[statusName]?.color || "#3d7a52"),
      isClosed: Boolean(defaultStatusMeta[statusName]?.isClosed ?? inferClosedStatus(statusName)),
    }
  );
}

function statusStyleAttribute(status = "") {
  const meta = getStatusMeta(status);
  const color = normalizeHexColor(meta.color);
  return ` style="background: ${escapeAttribute(hexToRgba(color, 0.14))}; color: ${escapeAttribute(color)}; border-color: ${escapeAttribute(hexToRgba(color, 0.28))};"`;
}

function saveTemperatureOption(level, label, color) {
  if (!canManageUsers() || !priorities.includes(level)) return;
  temperatureMeta = {
    ...temperatureMeta,
    [level]: {
      label: normalizeTemperatureLabel(label) || defaultTemperatureMeta[level]?.label || level,
      color: normalizeHexColor(color || defaultTemperatureMeta[level]?.color || "#5b6f82"),
    },
  };
  saveTemperatureMeta();
  markSaved("温度感設定を保存しました");
  render();
}

function normalizeTemperatureMeta(source = {}) {
  return Object.fromEntries(
    priorities.map((level) => {
      const current = source[level] && typeof source[level] === "object" ? source[level] : {};
      return [
        level,
        {
          label: normalizeTemperatureLabel(current.label ?? defaultTemperatureMeta[level]?.label ?? level),
          color: normalizeHexColor(current.color || defaultTemperatureMeta[level]?.color || "#5b6f82"),
        },
      ];
    })
  );
}

function getTemperatureMeta(level = "B") {
  const normalizedLevel = priorities.includes(level) ? level : "B";
  return temperatureMeta[normalizedLevel] || defaultTemperatureMeta[normalizedLevel] || { label: normalizedLevel, color: "#5b6f82" };
}

function normalizeTemperatureLabel(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, 18);
}

function temperatureOptionText(level = "B") {
  const meta = getTemperatureMeta(level);
  return meta.label && meta.label !== level ? `${level} ${meta.label}` : level;
}

function temperatureStyleAttribute(level = "B") {
  const color = normalizeHexColor(getTemperatureMeta(level).color);
  return ` style="background: ${escapeAttribute(hexToRgba(color, 0.14))}; color: ${escapeAttribute(color)}; border-color: ${escapeAttribute(hexToRgba(color, 0.28))};"`;
}

function inferClosedStatus(status = "") {
  const normalizedStatus = normalize(status);
  return normalizedStatus.includes("成約") || normalizedStatus.includes("保留") || normalizedStatus.includes("ng");
}

function normalizeHexColor(value = "") {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : "#3d7a52";
}

function hexToRgba(hex, alpha = 1) {
  const color = normalizeHexColor(hex).slice(1);
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getUserName(id) {
  return users.find((user) => user.id === id)?.name ?? "";
}

function resolveUserId(value) {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return "";
  return (
    users.find((user) => normalize(user.id) === normalizedValue)?.id ??
    users.find((user) => normalize(user.name) === normalizedValue || normalize(user.loginId) === normalizedValue || normalize(user.email) === normalizedValue)?.id ??
    ""
  );
}

function inferPrefectureFromText(...values) {
  for (const value of values) {
    if (!valueExists(value)) continue;
    const text = String(value).replace(/\s+/g, "");
    const prefecture = japanPrefectures.find((candidate) => text.includes(candidate));
    if (prefecture) return prefecture;
    const normalizedText = normalize(text);
    const matchedRule = prefectureInferenceRules
      .flatMap((rule) => rule.keywords.map((keyword) => ({ prefecture: rule.prefecture, keyword: normalize(keyword) })))
      .filter((rule) => rule.keyword && normalizedText.includes(rule.keyword))
      .sort((a, b) => b.keyword.length - a.keyword.length)[0];
    if (matchedRule) return matchedRule.prefecture;
  }
  return "";
}

function normalizePrefecture(value, ...fallbackValues) {
  const text = String(value || "").trim();
  const inferred = inferPrefectureFromText(text, ...fallbackValues);
  if (inferred) return inferred;

  const normalizedValue = normalize(text).replace(/[都道府県]$/, "");
  if (!normalizedValue) return "";
  return japanPrefectures.find((prefecture) => normalize(prefecture).replace(/[都道府県]$/, "") === normalizedValue) || "";
}

function getVenuePrefecture(venue) {
  return normalizePrefecture(venue.prefecture, venue.address, venue.municipality, venue.facilityName, venue.operator);
}

function refreshPrefectureFilter() {
  if (!elements.prefectureFilter) return;
  const current = elements.prefectureFilter.value;
  const prefectures = unique(venues.map(getVenuePrefecture).filter(Boolean)).sort(comparePrefectureNames);
  elements.prefectureFilter.replaceChildren(new Option("すべて", ""));
  prefectures.forEach((prefecture) => elements.prefectureFilter.append(new Option(prefecture, prefecture)));
  elements.prefectureFilter.value = prefectures.includes(current) ? current : "";
}

function getFilteredVenues() {
  const query = normalize(elements.searchInput?.value ?? "");
  const status = elements.statusFilter?.value ?? "";
  const prefecture = elements.prefectureFilter?.value ?? "";
  const assignee = elements.assigneeFilter?.value ?? "";
  const priority = elements.priorityFilter?.value ?? "";
  const visibility = elements.visibilityFilter?.value ?? "visible";
  const sortMode = elements.sortSelect?.value ?? "nextActionDate";

  return venues
    .filter((venue) => {
      const hidden = isVenueHidden(venue);
      const venuePrefecture = getVenuePrefecture(venue);
      const haystack = normalize(
        [
          venue.facilityName,
          venue.category,
          venue.operator,
          venuePrefecture,
          venue.prefecture,
          venue.municipality,
          venue.address,
          venue.phone,
          venue.email,
          venue.department,
          venue.contactName,
          venue.genres,
          venue.programPolicy,
          venue.status,
          venue.priority ? `温度感${temperatureOptionText(venue.priority)} 優先度${venue.priority} 評価${venue.priority}` : "",
          hidden ? "非表示 hidden" : "表示 visible",
          getUserName(venue.assignedUserId),
          getUserName(venue.callUpdatedByUserId),
          callStatusText(venue),
          venue.callUpdatedAt,
          venue.considerationDate,
          venue.nextActionDate,
          venue.notificationLeadDays ? `${venue.notificationLeadDays}日前 通知${venue.notificationLeadDays}` : "",
          venue.nextAction,
          venue.notesImportant ? "重要メモ 重要 備考" : "",
          venue.notes,
          venue.largeHallSeats,
          venue.mediumHallSeats,
          venue.smallHallSeats,
        ].join(" ")
      );
      return (
        (!query || haystack.includes(query)) &&
        (!status || venue.status === status) &&
        (!prefecture || venuePrefecture === prefecture) &&
        matchesAssigneeFilter(venue, assignee) &&
        (!priority || venue.priority === priority) &&
        (visibility === "all" || (visibility === "hidden" ? hidden : !hidden))
      );
    })
    .sort((a, b) => compareVenues(a, b, sortMode));
}

function matchesAssigneeFilter(venue, assignee) {
  if (!assignee) return true;
  if (assignee === "__current") return venue.assignedUserId === currentUserId;
  if (assignee === "__unassigned") return !venue.assignedUserId;
  return venue.assignedUserId === assignee;
}

function compareVenues(a, b, sortMode) {
  if (sortMode === "temperature" || sortMode === "rating") {
    const temperatureCompare = temperatureScore(b.priority) - temperatureScore(a.priority);
    if (temperatureCompare !== 0) return temperatureCompare;
  }

  if (sortMode === "notification") {
    const levelCompare = notificationSortScore(b) - notificationSortScore(a);
    if (levelCompare !== 0) return levelCompare;
    const dateCompare = (a.nextActionDate || "9999-12-31").localeCompare(b.nextActionDate || "9999-12-31");
    if (dateCompare !== 0) return dateCompare;
  }

  if (sortMode === "hidden") {
    const hiddenCompare = Number(isVenueHidden(b)) - Number(isVenueHidden(a));
    if (hiddenCompare !== 0) return hiddenCompare;
  }

  if (sortMode === "updated") {
    const updatedCompare = (b.callUpdatedAt || "").localeCompare(a.callUpdatedAt || "");
    if (updatedCompare !== 0) return updatedCompare;
  }

  if (sortMode === "prefecture") {
    const prefectureCompare = comparePrefectureNames(getVenuePrefecture(a), getVenuePrefecture(b));
    if (prefectureCompare !== 0) return prefectureCompare;
    const municipalityCompare = (a.municipality || "").localeCompare(b.municipality || "", "ja");
    if (municipalityCompare !== 0) return municipalityCompare;
    return (a.facilityName || "").localeCompare(b.facilityName || "", "ja");
  }

  if (sortMode === "name") {
    return (a.facilityName || "").localeCompare(b.facilityName || "", "ja");
  }

  const dateCompare = (a.nextActionDate || "9999-12-31").localeCompare(b.nextActionDate || "9999-12-31");
  if (dateCompare !== 0) return dateCompare;
  return (a.facilityName || "").localeCompare(b.facilityName || "", "ja");
}

function getCurrentColumnOrder() {
  const savedOrder = Array.isArray(columnOrders[currentUserId]) ? columnOrders[currentUserId] : [];
  const knownColumns = new Set(defaultColumnOrder);
  const validSavedOrder = savedOrder.filter((columnId) => knownColumns.has(columnId));
  const missingColumns = defaultColumnOrder.filter((columnId) => !validSavedOrder.includes(columnId));
  return [...validSavedOrder, ...missingColumns];
}

function getCurrentVisibleColumnIds() {
  const savedVisible = Array.isArray(visibleColumns[currentUserId]) ? visibleColumns[currentUserId] : null;
  const knownColumns = new Set(defaultColumnOrder);
  if (!savedVisible) return defaultColumnOrder;
  const validVisible = savedVisible.filter((columnId) => knownColumns.has(columnId));
  return validVisible.length ? validVisible : defaultColumnOrder;
}

function getCurrentPinnedColumnIds() {
  const savedPinned = Array.isArray(pinnedColumns[currentUserId]) ? pinnedColumns[currentUserId] : [];
  const knownColumns = new Set(defaultColumnOrder);
  const visibleIds = getCurrentVisibleColumnIds();
  return savedPinned.filter((columnId) => knownColumns.has(columnId) && visibleIds.includes(columnId));
}

function getOrderedTableColumns() {
  const columnMap = new Map(tableColumns.map((column) => [column.id, column]));
  const pinnedIds = getCurrentPinnedColumnIds();
  const visibleIds = getCurrentVisibleColumnIds();
  const columns = getCurrentColumnOrder()
    .filter((columnId) => visibleIds.includes(columnId))
    .map((columnId) => columnMap.get(columnId))
    .filter(Boolean);
  return [
    ...columns.filter((column) => pinnedIds.includes(column.id)),
    ...columns.filter((column) => !pinnedIds.includes(column.id)),
  ];
}

function setCurrentColumnOrder(order) {
  columnOrders = {
    ...columnOrders,
    [currentUserId]: order,
  };
  saveColumnOrders();
}

function setCurrentPinnedColumns(columnIds) {
  pinnedColumns = {
    ...pinnedColumns,
    [currentUserId]: columnIds,
  };
  savePinnedColumns();
}

function setCurrentVisibleColumns(columnIds) {
  const knownColumns = new Set(defaultColumnOrder);
  const nextColumnIds = unique(columnIds.filter((columnId) => knownColumns.has(columnId)));
  if (!nextColumnIds.length) {
    notifyMessage("表示列は最低1つ必要です。");
    return false;
  }

  visibleColumns = {
    ...visibleColumns,
    [currentUserId]: nextColumnIds,
  };
  pinnedColumns = {
    ...pinnedColumns,
    [currentUserId]: getCurrentPinnedColumnIds().filter((columnId) => nextColumnIds.includes(columnId)),
  };
  saveVisibleColumns();
  savePinnedColumns();
  return true;
}

function togglePinnedColumn(columnId) {
  const pinnedIds = getCurrentPinnedColumnIds();
  const nextPinnedIds = pinnedIds.includes(columnId)
    ? pinnedIds.filter((id) => id !== columnId)
    : [...pinnedIds, columnId];
  setCurrentPinnedColumns(nextPinnedIds);
  markSaved("固定列を保存しました");
  render();
}

function applyColumnPreset(presetKey) {
  const preset = columnPresets[presetKey];
  if (!preset) return;
  const presetColumns = preset.columns.filter((columnId) => defaultColumnOrder.includes(columnId));
  if (!setCurrentVisibleColumns(presetColumns)) return;
  setCurrentColumnOrder([
    ...presetColumns,
    ...defaultColumnOrder.filter((columnId) => !presetColumns.includes(columnId)),
  ]);
  markSaved(`${preset.label}の表示にしました`);
  render();
}

function moveColumn(draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return;
  const order = getOrderedTableColumns().map((column) => column.id);
  const draggedIndex = order.indexOf(draggedId);
  const targetIndex = order.indexOf(targetId);
  if (draggedIndex < 0 || targetIndex < 0) return;
  const [draggedColumn] = order.splice(draggedIndex, 1);
  const insertIndex = order.indexOf(targetId);
  order.splice(insertIndex, 0, draggedColumn);
  setCurrentColumnOrder(order);
  markSaved("列順を保存しました");
  render();
}

function renderTableHeader(columns) {
  const headerRow = elements.venueTableBody?.closest("table")?.querySelector("thead tr");
  if (!headerRow) return;
  const pinnedIds = getCurrentPinnedColumnIds();

  headerRow.innerHTML = columns
    .map(
      (column) => {
        const pinned = pinnedIds.includes(column.id);
        return `
        <th
          class="column-${escapeAttribute(column.id)} ${pinned ? "is-pinned-column" : ""}"
          draggable="true"
          data-column-id="${escapeAttribute(column.id)}"
          aria-label="${escapeAttribute(`${column.label}列`)}"
        >
          <span class="column-drag-handle" aria-hidden="true">↔</span>
          <span>${escapeHtml(column.label)}</span>
        </th>
      `;
      }
    )
    .join("");

  bindColumnDragControls(headerRow);
}

function bindColumnDragControls(headerRow) {
  let draggedId = "";

  headerRow.querySelectorAll("[data-column-id]").forEach((headerCell) => {
    headerCell.addEventListener("dragstart", (event) => {
      draggedId = headerCell.dataset.columnId;
      headerCell.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedId);
    });

    headerCell.addEventListener("dragover", (event) => {
      event.preventDefault();
      headerCell.classList.add("is-drop-target");
      event.dataTransfer.dropEffect = "move";
    });

    headerCell.addEventListener("dragleave", () => {
      headerCell.classList.remove("is-drop-target");
    });

    headerCell.addEventListener("dragend", () => {
      headerCell.classList.remove("is-dragging", "is-drop-target");
      draggedId = "";
    });

    headerCell.addEventListener("drop", (event) => {
      event.preventDefault();
      headerCell.classList.remove("is-drop-target");
      const droppedId = event.dataTransfer.getData("text/plain") || draggedId;
      moveColumn(droppedId, headerCell.dataset.columnId);
    });
  });
}

function renderPinnedColumnControls(columns) {
  if (!elements.pinnedColumnControls) return;
  const pinnedIds = getCurrentPinnedColumnIds();

  elements.pinnedColumnControls.innerHTML = columns
    .map(
      (column) => `
        <label class="column-pin-option">
          <input
            type="checkbox"
            data-column-pin-checkbox="${escapeAttribute(column.id)}"
            ${pinnedIds.includes(column.id) ? "checked" : ""}
          />
          <span>${escapeHtml(column.label)}</span>
        </label>
      `
    )
    .join("");

  elements.pinnedColumnControls.querySelectorAll("[data-column-pin-checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checkedIds = [...elements.pinnedColumnControls.querySelectorAll("[data-column-pin-checkbox]:checked")].map(
        (item) => item.dataset.columnPinCheckbox
      );
      setCurrentPinnedColumns(checkedIds);
      markSaved("固定列を保存しました");
      render();
    });
  });
}

function renderVisibleColumnControls() {
  if (!elements.visibleColumnControls && !elements.columnPresetControls) return;
  const visibleIds = getCurrentVisibleColumnIds();

  if (elements.columnPresetControls) {
    elements.columnPresetControls.innerHTML = Object.entries(columnPresets)
      .map(
        ([key, preset]) => `
          <button class="column-preset-button" type="button" data-column-preset="${escapeAttribute(key)}">
            ${escapeHtml(preset.label)}
          </button>
        `
      )
      .join("");

    elements.columnPresetControls.querySelectorAll("[data-column-preset]").forEach((button) => {
      button.addEventListener("click", () => applyColumnPreset(button.dataset.columnPreset));
    });
  }

  if (!elements.visibleColumnControls) return;
  elements.visibleColumnControls.innerHTML = tableColumns
    .map(
      (column) => `
        <label class="column-pin-option">
          <input
            type="checkbox"
            data-column-visible-checkbox="${escapeAttribute(column.id)}"
            ${visibleIds.includes(column.id) ? "checked" : ""}
          />
          <span>${escapeHtml(column.label)}</span>
        </label>
      `
    )
    .join("");

  elements.visibleColumnControls.querySelectorAll("[data-column-visible-checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checkedIds = [...elements.visibleColumnControls.querySelectorAll("[data-column-visible-checkbox]:checked")].map(
        (item) => item.dataset.columnVisibleCheckbox
      );
      if (!setCurrentVisibleColumns(checkedIds)) {
        checkbox.checked = true;
        return;
      }
      markSaved("表示列を保存しました");
      render();
    });
  });
}

function applyPinnedColumnStyles(columns) {
  const table = elements.venueTableBody?.closest("table");
  if (!table) return;

  const pinnedIds = getCurrentPinnedColumnIds();
  let left = 0;

  columns.forEach((column, index) => {
    const cells = [...table.querySelectorAll(`.column-${column.id}`)];
    const pinned = pinnedIds.includes(column.id);
    const headerCell = table.querySelector(`thead .column-${column.id}`);
    const width = headerCell?.getBoundingClientRect().width ?? 0;

    cells.forEach((cell) => {
      cell.classList.toggle("is-pinned-column", pinned);
      cell.style.left = pinned ? `${left}px` : "";
      cell.style.zIndex = pinned ? String(cell.tagName === "TH" ? 20 + index : 8 + index) : "";
    });

    if (pinned) left += width;
  });
}

function renderTable(filtered) {
  if (!elements.venueTableBody) return;
  const columns = getOrderedTableColumns();
  const table = elements.venueTableBody.closest("table");
  if (table) table.style.minWidth = `${getTableMinWidth(columns)}px`;
  renderTableHeader(columns);
  renderPinnedColumnControls(columns);
  renderVisibleColumnControls();
  setText(elements.visibleCount, `${filtered.length}件`);
  if (elements.emptyState) elements.emptyState.hidden = filtered.length > 0;
  elements.venueTableBody.replaceChildren();

  filtered.forEach((venue) => {
    const row = document.createElement("tr");
    row.className = [
      venue.id === selectedId ? "is-selected" : "",
      isVenueHidden(venue) ? "is-hidden-venue" : "",
      isClosedForCalls(venue) ? "is-call-ng" : "",
    ]
      .filter(Boolean)
      .join(" ");
    row.dataset.rowVenueId = venue.id;
    row.tabIndex = 0;
    row.innerHTML = columns
      .map((column) => `<td class="column-${escapeAttribute(column.id)}">${column.cell(venue)}</td>`)
      .join("");
    bindInlineControls(row);
    row.addEventListener("click", () => selectVenue(venue.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectVenue(venue.id);
      }
    });
    elements.venueTableBody.append(row);
  });

  applyPinnedColumnStyles(columns);
}

function getTableMinWidth(columns) {
  const width = columns.reduce((sum, column) => sum + (columnWidthHints[column.id] || 112), 0);
  return Math.max(720, width + 28);
}

function inlineInput(venue, field, type = "text", label = "", extraClass = "") {
  const value = type === "date" ? normalizeDate(venue[field]) : venue[field] ?? "";
  return `
    <input
      class="inline-control ${extraClass}"
      data-venue-id="${escapeAttribute(venue.id)}"
      data-inline-field="${escapeAttribute(field)}"
      type="${escapeAttribute(type)}"
      value="${escapeAttribute(value)}"
      aria-label="${escapeAttribute(`${venue.facilityName || "施設"} ${label || field}`)}"
    />
  `;
}

function inlineSelect(venue, field, options, extraClass = "") {
  const value = venue[field] ?? "";
  return `
    <select
      class="inline-control ${extraClass}"
      data-venue-id="${escapeAttribute(venue.id)}"
      data-inline-field="${escapeAttribute(field)}"
      aria-label="${escapeAttribute(`${venue.facilityName || "施設"} ${fieldLabels[field] || field}`)}"
    >
      ${options.map((option) => `<option value="${escapeAttribute(option)}" ${option === value ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </select>
  `;
}

function inlineTemperatureSelect(venue) {
  const value = normalizeTemperatureValue(venue.priority);
  return `
    <select
      class="inline-control temperature-control"
      data-venue-id="${escapeAttribute(venue.id)}"
      data-inline-field="priority"
      aria-label="${escapeAttribute(`${venue.facilityName || "施設"} 温度感`)}"
    >
      ${priorities
        .map((level) => `<option value="${escapeAttribute(level)}" ${level === value ? "selected" : ""}>${escapeHtml(temperatureOptionText(level))}</option>`)
        .join("")}
    </select>
  `;
}

function inlineVisibilitySelect(venue) {
  return `
    <select
      class="inline-control visibility-control"
      data-venue-id="${escapeAttribute(venue.id)}"
      data-inline-field="isHidden"
      aria-label="${escapeAttribute(`${venue.facilityName || "施設"} 表示状態`)}"
    >
      <option value="false" ${!isVenueHidden(venue) ? "selected" : ""}>表示</option>
      <option value="true" ${isVenueHidden(venue) ? "selected" : ""}>非表示</option>
    </select>
  `;
}

function hallScaleInputs(venue) {
  const fields = [
    ["largeHallSeats", "大"],
    ["mediumHallSeats", "中"],
    ["smallHallSeats", "小"],
  ];

  return `
    <div class="hall-scale" aria-label="${escapeAttribute(`${venue.facilityName || "施設"} ホール規模`)}">
      ${fields
        .map(
          ([field, label]) => `
            <label>
              <span>${escapeHtml(label)}</span>
              <input
                class="inline-control hall-seat-input"
                data-venue-id="${escapeAttribute(venue.id)}"
                data-inline-field="${escapeAttribute(field)}"
                type="number"
                min="0"
                value="${escapeAttribute(venue[field] ?? "")}"
                aria-label="${escapeAttribute(`${venue.facilityName || "施設"} ${fieldLabels[field]}`)}"
              />
            </label>
          `
        )
        .join("")}
    </div>
  `;
}

function notificationLeadDaysInput(venue) {
  const value = normalizeNotificationLeadDays(venue.notificationLeadDays);
  const defaultDays = getDefaultNotificationLeadDays();
  return `
    <div class="notification-days-control">
      <input
        class="inline-control notification-days-input"
        data-venue-id="${escapeAttribute(venue.id)}"
        data-inline-field="notificationLeadDays"
        type="number"
        min="0"
        max="365"
        value="${escapeAttribute(value)}"
        placeholder="${escapeAttribute(defaultDays)}"
        aria-label="${escapeAttribute(`${venue.facilityName || "施設"} 通知日数`)}"
      />
      <span>日前</span>
    </div>
  `;
}

function inlineAssigneeSelect(venue) {
  const activeUsers = users.filter((user) => user.active !== false || user.id === venue.assignedUserId);
  const options = [
    '<option value="">未割当</option>',
    ...activeUsers.map(
      (user) => `
        <option value="${escapeAttribute(user.id)}" ${user.id === venue.assignedUserId ? "selected" : ""}>
          ${escapeHtml(user.name)}
        </option>
      `
    ),
  ];

  return `
    <select
      class="inline-control"
      data-venue-id="${escapeAttribute(venue.id)}"
      data-inline-field="assignedUserId"
      aria-label="${escapeAttribute(`${venue.facilityName || "施設"} 担当スタッフ`)}"
    >
      ${options.join("")}
    </select>
  `;
}

function notesButtonMarkup(venue) {
  const hasNotes = valueExists(venue.notes);
  const isImportant = Boolean(venue.notesImportant);
  const preview = hasNotes ? truncateText(venue.notes, 34) : "メモなし";
  return `
    <div class="notes-cell">
      <button
        class="secondary-button notes-button ${hasNotes ? "has-notes" : ""} ${isImportant ? "is-important" : ""}"
        data-notes-open="${escapeAttribute(venue.id)}"
        type="button"
      >
        ${isImportant ? "重要メモ" : hasNotes ? "備考あり" : "備考"}
      </button>
      <span class="notes-preview ${isImportant ? "is-important" : ""}">${escapeHtml(preview)}</span>
    </div>
  `;
}

function bindInlineControls(container) {
  container.querySelectorAll("[data-inline-field]").forEach((control) => {
    control.addEventListener("click", (event) => event.stopPropagation());
    control.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Enter") {
        event.preventDefault();
        control.blur();
      }
    });
    control.addEventListener("change", () => {
      updateVenueField(control.dataset.venueId, control.dataset.inlineField, control.value);
    });
  });

  container.querySelectorAll("[data-notes-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      openNotesDialog(button.dataset.notesOpen);
    });
  });
}

function flashChangedFields(id, fields = []) {
  const changedFields = new Set(fields.filter(Boolean));
  if (!id || !changedFields.size) return;

  window.requestAnimationFrame(() => {
    const highlighted = [];
    document.querySelectorAll("[data-venue-id][data-inline-field]").forEach((control) => {
      if (control.dataset.venueId !== id || !changedFields.has(control.dataset.inlineField)) return;
      highlighted.push(control, control.closest("td"));
    });

    if (changedFields.has("notes") || changedFields.has("notesImportant")) {
      document.querySelectorAll("[data-notes-open]").forEach((button) => {
        if (button.dataset.notesOpen !== id) return;
        highlighted.push(button, button.closest("td"));
      });
    }

    highlighted.filter(Boolean).forEach((item) => item.classList.add("is-just-saved"));
    window.setTimeout(() => {
      highlighted.filter(Boolean).forEach((item) => item.classList.remove("is-just-saved"));
    }, 1800);
  });
}

function updateVenueField(id, field, value) {
  if (field === "considerationDate") {
    const considerationDate = normalizeVenueField(field, value);
    const updates = { considerationDate };
    const autoCallDate = getCallDateFromConsideration(considerationDate);
    if (autoCallDate) updates.nextActionDate = autoCallDate;
    updateVenueFields(id, updates);
    return;
  }

  const now = new Date().toISOString();
  const normalizedValue = normalizeVenueField(field, value);
  const undoSnapshot = createUndoSnapshot(`${fieldLabels[field] || field}の変更`);
  let changed = false;
  let historyEntry = null;

  venues = venues.map((venue) => {
    if (venue.id !== id) return venue;
    const previousValue = venue[field] ?? "";
    const shouldSyncTemperature = field === "priority" && String(venue.rating ?? "") !== String(normalizedValue);
    if (String(previousValue) === String(normalizedValue) && !shouldSyncTemperature) return venue;
    changed = true;
    if (String(previousValue) !== String(normalizedValue)) {
      historyEntry = createCallHistoryEntry(venue, field, previousValue, normalizedValue, now);
    }
    return normalizeHallScaleValues({
      ...venue,
      [field]: normalizedValue,
      ...(field === "priority" ? { rating: normalizedValue } : {}),
      callUpdatedAt: now,
      callUpdatedByUserId: currentUserId,
      updatedAt: now,
    });
  });

  if (!changed) return;
  setUndoSnapshot(undoSnapshot);
  if (historyEntry) appendCallHistory(historyEntry);
  handleNotificationStateAfterChange(id, [field]);
  saveVenues([id]);
  markSaved();
  render();
  flashChangedFields(id, [field]);
}

function updateVenueFields(id, updates) {
  const now = new Date().toISOString();
  const undoSnapshot = createUndoSnapshot("一覧の変更");
  let changed = false;
  const historyEntries = [];
  let changedFieldNames = [];
  const normalizedUpdates = Object.fromEntries(
    Object.entries(updates).map(([field, value]) => [field, normalizeVenueField(field, value)])
  );
  if (Object.hasOwn(normalizedUpdates, "priority")) {
    normalizedUpdates.rating = normalizedUpdates.priority;
  }

  venues = venues.map((venue) => {
    if (venue.id !== id) return venue;
    const changedFields = Object.entries(normalizedUpdates).filter(
      ([field, value]) => String(venue[field] ?? "") !== String(value ?? "")
    );
    if (!changedFields.length) return venue;
    changed = true;
    changedFieldNames = changedFields.map(([field]) => field);
    changedFields.forEach(([field, value]) => {
      historyEntries.push(createCallHistoryEntry(venue, field, venue[field] ?? "", value, now));
    });
    return normalizeHallScaleValues({
      ...venue,
      ...normalizedUpdates,
      callUpdatedAt: now,
      callUpdatedByUserId: currentUserId,
      updatedAt: now,
    });
  });

  if (!changed) return;
  setUndoSnapshot(undoSnapshot);
  appendCallHistory(historyEntries);
  handleNotificationStateAfterChange(id, changedFieldNames);
  saveVenues([id]);
  markSaved();
  render();
  flashChangedFields(id, changedFieldNames);
}

function normalizeVenueField(field, value) {
  const stringValue = String(value ?? "").trim();
  if (field === "nextActionDate" || field === "lastContactDate" || field === "considerationDate") return normalizeDate(stringValue);
  if (field === "callUpdatedAt") return normalizeDateTime(stringValue);
  if (field === "status") return statusOptions.includes(stringValue) ? stringValue : statusOptions[0] || "未着手";
  if (field === "priority") return normalizeTemperatureValue(stringValue);
  if (field === "rating") return normalizeTemperatureValue(stringValue);
  if (field === "programPolicy") return normalizeProgramPolicyValue(stringValue);
  if (field === "notificationLeadDays") return normalizeNotificationLeadDays(stringValue);
  if (field === "isHidden") return parseHiddenValue(stringValue);
  if (field === "notesImportant") return parseImportantNoteValue(value);
  if (["largeHallSeats", "mediumHallSeats", "smallHallSeats", "seatCount"].includes(field)) return normalizeDigits(stringValue);
  if (field === "assignedUserId") return users.some((user) => user.id === stringValue) ? stringValue : "";
  if (field === "callUpdatedByUserId") return users.some((user) => user.id === stringValue) ? stringValue : "";
  return stringValue;
}

function createCallHistoryEntry(venue, field, previousValue, nextValue, changedAt) {
  return {
    id: makeId(),
    venueId: venue.id,
    facilityName: venue.facilityName || "名称未設定",
    field,
    fieldLabel: fieldLabels[field] || field,
    previousValue,
    nextValue,
    changedAt,
    changedByUserId: currentUserId,
  };
}

function appendCallHistory(entries) {
  const nextEntries = Array.isArray(entries) ? entries.filter(Boolean) : [entries].filter(Boolean);
  if (!nextEntries.length) return;
  callHistory = [...nextEntries, ...callHistory].slice(0, 1000);
  saveCallHistory();
  queueRemoteCallHistorySave(nextEntries);
}

function openNotesDialog(id) {
  const venue = venues.find((item) => item.id === id);
  if (!venue || !elements.notesDialog || !elements.notesForm || !elements.notesTextarea) return;

  elements.notesForm.dataset.venueId = id;
  if (elements.notesTitle) elements.notesTitle.textContent = `${venue.facilityName || "名称未設定"}の備考`;
  elements.notesTextarea.value = venue.notes || "";
  if (elements.notesImportantInput) elements.notesImportantInput.checked = Boolean(venue.notesImportant);
  elements.notesDialog.showModal();
  elements.notesTextarea.focus();
}

function closeNotesDialog() {
  elements.notesDialog?.close();
}

function saveNotesFromForm(event) {
  event.preventDefault();
  const id = elements.notesForm?.dataset.venueId;
  if (!id) return;
  updateVenueFields(id, {
    notes: elements.notesTextarea?.value ?? "",
    notesImportant: Boolean(elements.notesImportantInput?.checked),
  });
  closeNotesDialog();
}

function clearVenueNotificationHistory(id) {
  const nextNotified = Object.fromEntries(
    Object.entries(notificationSettings.notified ?? {}).filter(([key]) => !key.startsWith(`${id}:`))
  );
  const nextDismissed = Object.fromEntries(
    Object.entries(notificationSettings.dismissed ?? {}).filter(([key]) => !key.startsWith(`${id}:`))
  );
  notificationSettings = {
    ...notificationSettings,
    notified: nextNotified,
    dismissed: nextDismissed,
  };
  saveNotificationSettings();
}

function handleNotificationStateAfterChange(id, fields) {
  const changedFields = new Set(fields);
  const dismissCondition = notificationSettings.dismissCondition || "nextActionDate";
  const shouldDismiss =
    (dismissCondition === "nextActionDate" && changedFields.has("nextActionDate")) ||
    (dismissCondition === "status" && changedFields.has("status")) ||
    (dismissCondition === "either" && (changedFields.has("nextActionDate") || changedFields.has("status")));
  const affectsNotification =
    changedFields.has("nextActionDate") || changedFields.has("status") || changedFields.has("notificationLeadDays");

  if (!affectsNotification) return;

  const nextNotified = Object.fromEntries(
    Object.entries(notificationSettings.notified ?? {}).filter(([key]) => !key.startsWith(`${id}:`))
  );
  notificationSettings = {
    ...notificationSettings,
    notified: nextNotified,
  };

  if (shouldDismiss) {
    const venue = venues.find((item) => item.id === id);
    if (venue) {
      const key = notificationStateKey(venue);
      notificationSettings.dismissed = {
        ...(notificationSettings.dismissed ?? {}),
        [key]: new Date().toISOString(),
      };
    }
  }

  saveNotificationSettings();
}

function renderDetail() {
  if (!elements.detailTitle || !elements.detailContent || !elements.detailStatus) return;

  const venue = venues.find((item) => item.id === selectedId);
  if (!venue) {
    elements.detailTitle.textContent = "施設を選択";
    elements.detailStatus.textContent = "未選択";
    elements.detailStatus.className = "status-pill";
    elements.detailContent.innerHTML = '<p class="empty-detail">一覧から施設を選ぶか、新規施設を追加してください。</p>';
    return;
  }

  elements.detailTitle.textContent = venue.facilityName || "名称未設定";
  elements.detailStatus.outerHTML = statusMarkup(venue.status, "detailStatus");
  elements.detailStatus = document.querySelector("#detailStatus");

  const checks = requiredChecks.filter((check) => !valueExists(venue[check.field]));
  const checklistItems = checks.length
    ? checks.map((check) => `<li><span class="marker" aria-hidden="true"></span><span>${escapeHtml(check.text)}</span></li>`).join("")
    : '<li><span class="marker" aria-hidden="true"></span><span>主要項目は確認済みです。次回提案内容の精度を上げましょう。</span></li>';

  elements.detailContent.innerHTML = `
    <div class="detail-actions">
      <button class="primary-button" id="editSelectedButton" type="button">編集</button>
      <button class="secondary-button" id="duplicateSelectedButton" type="button">複製</button>
    </div>

    <section class="detail-section">
      <h3>確認すべき項目</h3>
      <ul class="checklist">${checklistItems}</ul>
    </section>

    <section class="detail-section">
      <h3>基本情報</h3>
      <div class="info-grid">
        ${infoItem("種別", venue.category)}
        ${infoItem("管理運営機関", venue.operator)}
        ${infoItem("所在地", [venue.prefecture, venue.municipality].filter(Boolean).join(" "))}
        ${infoItem("住所", venue.address)}
        ${infoItem("電話", venue.phone)}
        ${infoItem("FAX", venue.fax)}
        ${infoItem("アドレス", venue.email, "mailto")}
        ${infoItem("Web", venue.website, "url")}
      </div>
    </section>

    <section class="detail-section">
      <h3>担当者・公演情報</h3>
      <div class="info-grid">
        ${infoItem("担当部署", venue.department)}
        ${infoItem("担当者", venue.contactName)}
        ${infoItem("主ホール", venue.mainHallName)}
        ${infoItem("ホール規模", hallScaleText(venue))}
        ${infoItem("得意ジャンル", venue.genres)}
        ${infoItem("自主事業", venue.programPolicy)}
      </div>
    </section>

    <section class="detail-section">
      <h3>営業状況</h3>
      <div class="info-grid">
        ${infoItem("状態", venue.status)}
        ${infoItem("温度感", temperaturePillMarkup(venue.priority), "html")}
        ${infoItem("表示状態", isVenueHidden(venue) ? "非表示" : "表示")}
        ${infoItem("担当スタッフ", getUserName(venue.assignedUserId))}
        ${infoItem("最終接触日", formatDate(venue.lastContactDate))}
        ${infoItem("架電更新", callStatusText(venue))}
        ${infoItem("架電者", getUserName(venue.callUpdatedByUserId))}
        ${infoItem("検討時期", formatDate(venue.considerationDate))}
        ${infoItem("次回架電日", formatDate(venue.nextActionDate))}
        ${infoItem("通知日数", notificationLeadDaysText(venue))}
        ${infoItem("次回アクション", venue.nextAction)}
      </div>
    </section>

    <section class="detail-section">
      <h3>備考</h3>
      ${venue.notesImportant ? '<span class="important-note-pill">重要メモ</span>' : ""}
      <p class="notes-box">${escapeHtml(venue.notes || "メモはまだありません。")}</p>
    </section>
  `;

  document.querySelector("#editSelectedButton")?.addEventListener("click", () => openForm(venue));
  document.querySelector("#duplicateSelectedButton")?.addEventListener("click", () => duplicateVenue(venue));
}

function selectVenue(id, options = {}) {
  selectedId = id;
  if (window.history?.replaceState) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`);
  }
  render();
  if (options.scroll) {
    window.requestAnimationFrame(() => scrollToVenue(id));
  }
}

function openForm(venue = null) {
  if (!elements.venueForm || !elements.venueDialog) return;
  elements.venueForm.reset();
  refreshStatusFormOptions(venue?.status ?? statusOptions[0]);
  refreshTemperatureFormOptions(venue?.priority ?? "B");
  refreshAssigneeOptions(venue?.assignedUserId ?? currentUserId);
  elements.formTitle.textContent = venue ? "施設を編集" : "新規施設";
  elements.venueForm.dataset.editingId = venue?.id ?? "";
  if (elements.deleteVenueButton) elements.deleteVenueButton.hidden = !venue || !canManageUsers();

  const source = venue ?? {
    status: statusOptions[0] || "未着手",
    priority: "B",
    rating: "B",
    programPolicy: "△",
    isHidden: false,
    assignedUserId: currentUserId,
    notificationLeadDays: "",
  };
  Object.keys(fieldLabels).forEach((field) => {
    const control = elements.venueForm.elements[field];
    if (control) control.value = source[field] ?? "";
  });

  elements.venueDialog.showModal();
}

function closeForm() {
  elements.venueDialog?.close();
}

function saveVenueFromForm(event) {
  event.preventDefault();
  const formData = new FormData(elements.venueForm);
  const now = new Date().toISOString();
  const id = elements.venueForm.dataset.editingId;
  let savedVenueId = id;
  const undoSnapshot = createUndoSnapshot(id ? "施設編集" : "施設追加");
  const nextVenue = {};

  Object.keys(fieldLabels).forEach((field) => {
    if (elements.venueForm.elements[field]) {
      nextVenue[field] = normalizeVenueField(field, formData.get(field));
    }
  });
  nextVenue.priority = normalizeVenueField("priority", nextVenue.priority);
  nextVenue.rating = nextVenue.priority;
  nextVenue.assignedUserId = nextVenue.assignedUserId || currentUserId;
  if (nextVenue.considerationDate && !nextVenue.nextActionDate) {
    nextVenue.nextActionDate = getCallDateFromConsideration(nextVenue.considerationDate);
  }
  Object.assign(nextVenue, normalizeHallScaleValues(nextVenue));

  if (id) {
    venues = venues.map((venue) =>
      venue.id === id
        ? {
            ...venue,
            ...nextVenue,
            updatedAt: now,
          }
        : venue
    );
    selectedId = id;
  } else {
    const newVenue = {
      id: makeId(),
      ...nextVenue,
      callUpdatedAt: "",
      callUpdatedByUserId: "",
      createdAt: now,
      updatedAt: now,
    };
    venues = [newVenue, ...venues];
    selectedId = newVenue.id;
    savedVenueId = newVenue.id;
  }

  saveVenues(savedVenueId ? [savedVenueId] : null);
  setUndoSnapshot(undoSnapshot);
  markSaved();
  closeForm();
  render();
}

function deleteSelectedVenue() {
  if (!canManageUsers()) {
    notifyMessage("削除は管理ユーザーのみ実行できます。");
    return;
  }

  const id = elements.venueForm.dataset.editingId;
  const venue = venues.find((item) => item.id === id);
  if (!venue) return;
  const confirmed = confirm(`${venue.facilityName || "この施設"}を削除しますか？`);
  if (!confirmed) return;

  const undoSnapshot = createUndoSnapshot("施設削除");
  venues = venues.filter((item) => item.id !== id);
  selectedId = venues[0]?.id ?? null;
  saveVenues([]);
  queueRemoteVenueDelete(id);
  setUndoSnapshot(undoSnapshot);
  markSaved();
  closeForm();
  render();
}

function duplicateVenue(venue) {
  const now = new Date().toISOString();
  const undoSnapshot = createUndoSnapshot("施設複製");
  const clone = {
    ...venue,
    id: makeId(),
    facilityName: `${venue.facilityName || "名称未設定"} コピー`,
    status: statusOptions[0] || "未着手",
    isHidden: false,
    assignedUserId: currentUserId,
    lastContactDate: "",
    callUpdatedAt: "",
    callUpdatedByUserId: "",
    considerationDate: "",
    nextActionDate: "",
    notificationLeadDays: "",
    nextAction: "",
    createdAt: now,
    updatedAt: now,
  };
  venues = [clone, ...venues];
  selectedId = clone.id;
  saveVenues([clone.id]);
  setUndoSnapshot(undoSnapshot);
  markSaved();
  render();
}

async function handleCsvSelection(event) {
  const [file] = event.target.files;
  if (!file) return;

  const text = await readCsvFile(file);
  const parsed = parseCsv(text);
  if (parsed.length < 2) {
    showImportMessage("CSVに取り込める行が見つかりませんでした。");
    return;
  }

  const headers = parsed[0].map((header) => header.trim());
  const rows = parsed.slice(1).filter((row) => row.some((cell) => valueExists(cell)));
  pendingMap = mapHeaders(headers);
  pendingImportHeaders = headers;
  pendingImportSource = rows.map((row) => rowToVenue(headers, row, pendingMap)).filter((venue) => valueExists(venue.facilityName));
  pendingImport = pendingImportSource.map(applyImportPrefectureChoice);

  if (!pendingImport.length) {
    showImportMessage("施設名に対応する列が見つかりませんでした。列名に「施設名」または「名称」を含めてください。");
    return;
  }

  renderImportPreview(headers);
}

function handleImportPrefectureChange() {
  if (!pendingImportSource.length) return;
  pendingImport = pendingImportSource.map(applyImportPrefectureChoice);
  renderImportPreview(pendingImportHeaders);
}

function applyImportPrefectureChoice(venue) {
  const selectedPrefecture = elements.importPrefecture?.value || "";
  if (!selectedPrefecture || valueExists(venue.prefecture)) return { ...venue };
  return {
    ...venue,
    prefecture: selectedPrefecture,
  };
}

function renderImportPreview(headers) {
  if (!elements.importPreview) return;
  const mappedLabels = Object.entries(pendingMap)
    .map(([index, field]) => `${escapeHtml(headers[index])} → ${escapeHtml(fieldLabels[field])}`)
    .join("、");

  const rows = pendingImport
    .slice(0, 5)
    .map(
      (venue) => `
        <tr>
          <td>${escapeHtml(venue.facilityName)}</td>
          <td>${escapeHtml([venue.prefecture, venue.municipality].filter(Boolean).join(" ") || "-")}</td>
          <td>${escapeHtml(venue.phone || "-")}</td>
          <td>${escapeHtml(venue.status || "未着手")}</td>
        </tr>
      `
    )
    .join("");

  elements.importPreview.hidden = false;
  elements.importPreview.innerHTML = `
    <div>
      <strong>${pendingImport.length}件を読み込みました。</strong>
      <span class="muted">対応列: ${mappedLabels || "自動対応なし"}</span>
      ${elements.importPrefecture?.value ? `<span class="muted">都道府県補完: ${escapeHtml(elements.importPrefecture.value)}</span>` : ""}
    </div>
    <table class="preview-table">
      <thead>
        <tr><th>施設名</th><th>所在地</th><th>電話</th><th>状態</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="detail-actions">
      <button class="primary-button" id="commitImportButton" type="button">取り込む</button>
      <button class="secondary-button" id="clearImportButton" type="button">取り消し</button>
    </div>
  `;

  document.querySelector("#commitImportButton")?.addEventListener("click", commitImport);
  document.querySelector("#clearImportButton")?.addEventListener("click", clearImportPreview);
}

function commitImport() {
  const merge = elements.mergeDuplicates?.checked ?? true;
  const now = new Date().toISOString();
  const undoSnapshot = createUndoSnapshot("CSV取り込み");
  let added = 0;
  let updated = 0;
  const nextVenues = [...venues];
  const changedImportIds = [];

  pendingImport.forEach((venue) => {
    const normalizedVenue = normalizeImportedVenue(venue, now);
    const existingIndex = merge ? nextVenues.findIndex((item) => isSameVenue(item, normalizedVenue)) : -1;
    const hasTemperatureValue = valueExists(venue.priority) || valueExists(venue.rating);

    if (existingIndex >= 0) {
      const mergeValues = removeEmptyValues(normalizedVenue);
      if (!hasTemperatureValue) {
        delete mergeValues.priority;
        delete mergeValues.rating;
      }
      ["status", "programPolicy", "isHidden", "assignedUserId"].forEach((field) => {
        if (!valueExists(venue[field])) delete mergeValues[field];
      });
      nextVenues[existingIndex] = {
        ...nextVenues[existingIndex],
        ...mergeValues,
        id: nextVenues[existingIndex].id,
        createdAt: nextVenues[existingIndex].createdAt,
        updatedAt: now,
      };
      changedImportIds.push(nextVenues[existingIndex].id);
      updated += 1;
    } else {
      const newVenue = {
        ...normalizedVenue,
        status: normalizedVenue.status || statusOptions[0] || "未着手",
        priority: normalizedVenue.priority || "B",
        rating: normalizedVenue.priority || "B",
        programPolicy: normalizedVenue.programPolicy || "△",
        isHidden: valueExists(normalizedVenue.isHidden) ? normalizedVenue.isHidden : false,
        assignedUserId: normalizedVenue.assignedUserId || currentUserId,
      };
      nextVenues.unshift(newVenue);
      changedImportIds.push(newVenue.id);
      added += 1;
    }
  });

  venues = nextVenues;
  selectedId = venues[0]?.id ?? null;
  saveVenues(changedImportIds);
  setUndoSnapshot(undoSnapshot);
  markSaved();
  showImportMessage(`${added}件を追加、${updated}件を更新しました。`);
  pendingImport = [];
  pendingImportSource = [];
  pendingImportHeaders = [];
  pendingMap = {};
  if (elements.csvFile) elements.csvFile.value = "";
  render();
}

function clearImportPreview() {
  pendingImport = [];
  pendingImportSource = [];
  pendingImportHeaders = [];
  pendingMap = {};
  if (elements.csvFile) elements.csvFile.value = "";
  if (elements.importPreview) {
    elements.importPreview.hidden = true;
    elements.importPreview.replaceChildren();
  }
}

function showImportMessage(message) {
  if (!elements.importPreview) return;
  elements.importPreview.hidden = false;
  elements.importPreview.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
}

function rowToVenue(headers, row, mapping) {
  const venue = {};
  Object.entries(mapping).forEach(([index, field]) => {
    venue[field] = String(row[Number(index)] ?? "").trim();
  });
  return venue;
}

function normalizeImportedVenue(venue, now) {
  const seatCount = normalizeVenueField("seatCount", venue.seatCount);
  const largeHallSeats = valueExists(venue.largeHallSeats)
    ? normalizeVenueField("largeHallSeats", venue.largeHallSeats)
    : seatCount;
  const considerationDate = normalizeDate(venue.considerationDate);
  const nextActionDate = normalizeDate(venue.nextActionDate) || getCallDateFromConsideration(considerationDate);
  const temperature = valueExists(venue.priority)
    ? normalizeVenueField("priority", venue.priority)
    : valueExists(venue.rating)
      ? normalizeVenueField("priority", venue.rating)
      : "";
  const prefecture = normalizePrefecture(venue.prefecture, venue.address, venue.municipality, venue.facilityName, venue.operator);
  return normalizeHallScaleValues({
    id: makeId(),
    facilityName: venue.facilityName || "",
    category: venue.category || "",
    operator: venue.operator || "",
    prefecture,
    municipality: venue.municipality || "",
    address: venue.address || "",
    phone: venue.phone || "",
    fax: venue.fax || "",
    email: venue.email || "",
    website: venue.website || "",
    department: venue.department || "",
    contactName: venue.contactName || "",
    mainHallName: venue.mainHallName || "",
    seatCount,
    largeHallSeats,
    mediumHallSeats: normalizeVenueField("mediumHallSeats", venue.mediumHallSeats),
    smallHallSeats: normalizeVenueField("smallHallSeats", venue.smallHallSeats),
    genres: venue.genres || "",
    programPolicy: valueExists(venue.programPolicy) ? normalizeVenueField("programPolicy", venue.programPolicy) : "",
    status: statusOptions.includes(venue.status) ? venue.status : "",
    priority: temperature,
    rating: temperature,
    isHidden: valueExists(venue.isHidden) ? normalizeVenueField("isHidden", venue.isHidden) : "",
    assignedUserId: resolveUserId(venue.assignedUserId),
    lastContactDate: normalizeDate(venue.lastContactDate),
    callUpdatedAt: normalizeDateTime(venue.callUpdatedAt),
    callUpdatedByUserId: resolveUserId(venue.callUpdatedByUserId),
    considerationDate,
    nextActionDate,
    notificationLeadDays: normalizeVenueField("notificationLeadDays", venue.notificationLeadDays),
    nextAction: venue.nextAction || "",
    notes: venue.notes || "",
    createdAt: now,
    updatedAt: now,
  });
}

function mapHeaders(headers) {
  const mapping = {};
  headers.forEach((header, index) => {
    const normalizedHeader = normalizeHeader(header);
    const field = Object.entries(csvAliases)
      .flatMap(([candidateField, aliases]) =>
        aliases
          .map((alias) => normalizeHeader(alias))
          .filter((alias) => alias && normalizedHeader.includes(alias))
          .map((alias) => ({ field: candidateField, length: alias.length }))
      )
      .sort((a, b) => b.length - a.length)?.[0]?.field;
    if (field && !Object.values(mapping).includes(field)) {
      mapping[index] = field;
    }
  });
  return mapping;
}

async function readCsvFile(file) {
  const buffer = await file.arrayBuffer();
  const utf8Text = new TextDecoder("utf-8").decode(buffer);
  if (!utf8Text.includes("\uFFFD")) return stripBom(utf8Text);

  try {
    return stripBom(new TextDecoder("shift-jis").decode(buffer));
  } catch {
    return stripBom(utf8Text);
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  return rows;
}

function exportCsv() {
  const fields = Object.keys(fieldLabels).filter((field) => field !== "rating");
  const rows = [
    fields.map((field) => fieldLabels[field]),
    ...venues.map((venue) =>
      fields.map((field) => {
        if (field === "assignedUserId") return getUserName(venue.assignedUserId);
        if (field === "callUpdatedByUserId") return getUserName(venue.callUpdatedByUserId);
        if (field === "isHidden") return isVenueHidden(venue) ? "非表示" : "表示";
        return venue[field] ?? "";
      })
    ),
  ];
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `文化施設営業管理_${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function startNotificationChecks() {
  checkCallNotifications(false);
  if (notificationTimer) window.clearInterval(notificationTimer);
  notificationTimer = window.setInterval(() => checkCallNotifications(false), 60 * 1000);
}

function renderNotificationPanel(feedbackMessage = "", feedbackTone = "") {
  if (!elements.notificationStatus && !elements.upcomingCalls && !elements.topAlertCount && !elements.alertDialog) return;

  const support = supportsNotifications();
  const permission = support ? window.Notification.permission : "unsupported";
  const upcoming = getUpcomingCalls();

  if (elements.notificationLeadDays) {
    elements.notificationLeadDays.value = String(notificationSettings.leadDays);
  }
  if (elements.notificationPopupLeadDays) {
    elements.notificationPopupLeadDays.value = String(notificationSettings.popupLeadDays ?? notificationSettings.leadDays ?? 3);
  }
  if (elements.notificationDisplayMode) {
    elements.notificationDisplayMode.value = getNotificationDisplayMode();
  }
  if (elements.notificationScope) {
    elements.notificationScope.value = getNotificationScope();
  }
  if (elements.notificationDismissCondition) {
    elements.notificationDismissCondition.value = notificationSettings.dismissCondition || "nextActionDate";
  }

  if (elements.notificationStatus) {
    if (!support) {
      elements.notificationStatus.textContent = "非対応";
      elements.notificationStatus.className = "status-pill hold";
    } else if (permission === "granted" && notificationSettings.enabled) {
      elements.notificationStatus.textContent = "通知ON";
      elements.notificationStatus.className = "status-pill done";
    } else if (permission === "denied") {
      elements.notificationStatus.textContent = "ブロック";
      elements.notificationStatus.className = "status-pill hold";
    } else {
      elements.notificationStatus.textContent = "通知OFF";
      elements.notificationStatus.className = "status-pill";
    }
  }

  if (elements.enableNotificationsButton) {
    elements.enableNotificationsButton.textContent = getNotificationButtonText(support, permission);
    elements.enableNotificationsButton.disabled = !support;
  }

  if (elements.notificationHelp) {
    elements.notificationHelp.textContent = feedbackMessage || getNotificationHelpMessage(support, permission);
    elements.notificationHelp.className = `notification-help ${feedbackTone || getNotificationHelpTone(support, permission)}`.trim();
  }

  if (elements.notificationBadge) {
    elements.notificationBadge.hidden = upcoming.length === 0;
    elements.notificationBadge.textContent = toCircledNumber(upcoming.length);
  }
  renderTopAlertCount(upcoming.length);
  if (elements.alertDialog?.open) {
    renderAlertDialog(upcoming);
  }

  if (elements.upcomingCalls) {
    elements.upcomingCalls.innerHTML = upcoming.length
      ? `<ul class="notification-list">${upcoming
          .map(
            (venue) => `
              <li>
                ${notificationBadgeMarkup(venue)}
                <strong>${escapeHtml(formatDate(venue.nextActionDate))}</strong>
                <span>${escapeHtml(venue.facilityName || "名称未設定")} / ${escapeHtml(venue.nextAction || "架電予定")} / ${escapeHtml(notificationLeadDaysText(venue))}</span>
              </li>
            `
          )
          .join("")}</ul>`
      : '<p class="muted">近日の架電予定はありません。</p>';
  }
}

function renderTopAlertCount(count = getUpcomingCalls().length) {
  if (!elements.topAlertCount) return;
  const label = count > 0 ? `要確認 ${count}件` : "要確認はありません";
  elements.topAlertCount.classList.toggle("is-empty", count === 0);
  elements.topAlertCount.setAttribute("aria-label", label);
  if (elements.topAlertCountNumber) {
    elements.topAlertCountNumber.textContent = String(count);
  }
}

function openAlertDialog(event) {
  event?.preventDefault();
  if (!elements.alertDialog) return;
  renderAlertDialog();
  elements.alertDialog.showModal();
}

function closeAlertDialog() {
  elements.alertDialog?.close();
}

function renderAlertDialog(items = getUpcomingCalls()) {
  if (!elements.alertVenueList) return;

  setText(elements.alertDialogCount, `${items.length}件`);
  setText(
    elements.alertDialogLead,
    `${notificationScopes[getNotificationScope()]}で、通知対象に入っている施設を表示しています。`
  );

  if (!items.length) {
    elements.alertVenueList.innerHTML = '<p class="empty-state">現在、確認が必要な施設はありません。</p>';
    return;
  }

  elements.alertVenueList.innerHTML = items.map(alertVenueItemMarkup).join("");
  elements.alertVenueList.querySelectorAll("[data-alert-jump]").forEach((button) => {
    button.addEventListener("click", () => jumpToVenue(button.dataset.alertJump));
  });
}

function alertVenueItemMarkup(venue) {
  const location = [venue.prefecture, venue.municipality].filter(Boolean).join(" ") || "所在地未設定";
  return `
    <article class="alert-venue-item">
      <div class="alert-venue-main">
        <div class="alert-venue-title">
          ${notificationBadgeMarkup(venue)}
          <strong>${escapeHtml(venue.facilityName || "名称未設定")}</strong>
        </div>
        <div class="alert-venue-meta">
          <span>次回 ${escapeHtml(formatDate(venue.nextActionDate))}</span>
          <span>${escapeHtml(notificationRemainingText(venue))}</span>
          <span>${escapeHtml(location)}</span>
          <span>担当 ${escapeHtml(getUserName(venue.assignedUserId) || "未割当")}</span>
          <span>${escapeHtml(venue.nextAction || "次回アクション未設定")}</span>
        </div>
      </div>
      <button class="primary-button" type="button" data-alert-jump="${escapeAttribute(venue.id)}">表示</button>
    </article>
  `;
}

function jumpToVenue(id) {
  if (!id || !venues.some((venue) => venue.id === id)) return;
  closeAlertDialog();
  resetFiltersForVenueJump();
  selectVenue(id, { scroll: true });
}

function resetFiltersForVenueJump() {
  if (elements.searchInput) elements.searchInput.value = "";
  [elements.statusFilter, elements.prefectureFilter, elements.assigneeFilter, elements.priorityFilter, elements.visibilityFilter].forEach((select) => {
    if (select) select.value = "";
  });
}

function scrollToVenue(id) {
  const row = [...(elements.venueTableBody?.querySelectorAll("tr") ?? [])].find((item) => item.dataset.rowVenueId === id);
  const detailPanel = elements.detailContent?.closest(".detail-panel");
  const target = detailPanel || row;
  target?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  row?.focus({ preventScroll: true });
}

function renderCallWorkList() {
  if (!elements.callWorkList) return;

  const items = getUpcomingCalls();
  setText(elements.callWorkCount, `${items.length}件`);

  if (!items.length) {
    elements.callWorkList.innerHTML = '<p class="muted">今すぐ対応する架電先はありません。</p>';
    return;
  }

  elements.callWorkList.innerHTML = items
    .map(
      (venue) => `
        <article class="call-work-item">
          <div class="call-work-main">
            <div>
              <strong>${notificationBadgeMarkup(venue)} ${escapeHtml(venue.facilityName || "名称未設定")}</strong>
              <span>${escapeHtml([venue.prefecture, venue.municipality].filter(Boolean).join(" ") || "所在地未設定")}</span>
            </div>
            <a href="tel:${escapeAttribute(venue.phone || "")}" class="call-phone">${escapeHtml(venue.phone || "電話未設定")}</a>
          </div>
          <div class="call-work-fields">
            <label>状態${inlineSelect(venue, "status", statusOptions)}</label>
            <label>温度感${inlineTemperatureSelect(venue)}</label>
            <label>担当者${inlineInput(venue, "contactName", "text", "担当者")}</label>
            <label>次回架電${inlineInput(venue, "nextActionDate", "date", "次回架電日", callDateClass(venue))}</label>
            <label>通知日数${notificationLeadDaysInput(venue)}</label>
            <div class="call-status-field"><span>架電状況</span>${callStatusMarkup(venue)}</div>
            <div class="call-status-field"><span>架電者</span><strong>${escapeHtml(getUserName(venue.callUpdatedByUserId) || "-")}</strong></div>
            <label class="wide-call-field">次回アクション${inlineInput(venue, "nextAction", "text", "次回アクション")}</label>
            ${notesButtonMarkup(venue)}
          </div>
        </article>
      `
    )
    .join("");

  bindInlineControls(elements.callWorkList);
}

function renderHistoryPage() {
  if (!elements.historyContent && !elements.historyAccessDenied) return;

  const isAdmin = canManageUsers();
  if (elements.historyAccessDenied) elements.historyAccessDenied.hidden = isAdmin;
  if (elements.historyContent) elements.historyContent.hidden = !isAdmin;
  if (!isAdmin) return;

  const today = new Date().toISOString().slice(0, 10);
  const entries = [...callHistory].sort((a, b) => (b.changedAt || "").localeCompare(a.changedAt || ""));
  const viewEntries = elements.historyImportantOnly?.checked ? entries.filter(isImportantHistoryEntry) : entries;
  const todayEntries = viewEntries.filter((entry) => String(entry.changedAt || "").startsWith(today));
  const venueCount = unique(viewEntries.map((entry) => entry.venueId).filter(Boolean)).length;
  const callerCount = unique(viewEntries.map((entry) => entry.changedByUserId).filter(Boolean)).length;

  setText(elements.historyMetricTotal, viewEntries.length);
  setText(elements.historyMetricToday, todayEntries.length);
  setText(elements.historyMetricVenues, venueCount);
  setText(elements.historyMetricCallers, callerCount);
  renderSummaryList(elements.callerSummary, summarize(viewEntries, "changedByUserId", getUserName));
  renderSummaryList(elements.statusSummary, summarize(viewEntries, "field", (field) => fieldLabels[field] || field));
  renderHistoryTable(viewEntries);
}

function isImportantHistoryEntry(entry) {
  return importantHistoryFields.has(entry.field);
}

function renderSummaryList(container, items) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = '<p class="muted">まだ履歴がありません。</p>';
    return;
  }

  container.innerHTML = `
    <div class="summary-list">
      ${items
        .map(
          (item) => `
            <div class="summary-row">
              <span>${escapeHtml(item.label || "未設定")}</span>
              <strong>${item.count}</strong>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function summarize(entries, key, labeler) {
  const counts = new Map();
  entries.forEach((entry) => {
    const value = entry[key] || "";
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([value, count]) => ({
      value,
      label: labeler(value) || "未設定",
      count,
    }))
    .sort((a, b) => b.count - a.count || String(a.label).localeCompare(String(b.label), "ja"));
}

function renderHistoryTable(entries) {
  if (!elements.historyTableBody) return;

  if (!entries.length) {
    elements.historyTableBody.innerHTML = '<tr><td colspan="6" class="empty-table-cell">まだ履歴がありません。</td></tr>';
    return;
  }

  elements.historyTableBody.innerHTML = entries
    .slice(0, 250)
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(formatDateTime(entry.changedAt))}</td>
          <td>${escapeHtml(entry.facilityName || "名称未設定")}</td>
          <td>${escapeHtml(getUserName(entry.changedByUserId) || "-")}</td>
          <td>${escapeHtml(entry.fieldLabel || fieldLabels[entry.field] || entry.field || "-")}</td>
          <td>${escapeHtml(formatHistoryValue(entry.field, entry.previousValue))}</td>
          <td>${escapeHtml(formatHistoryValue(entry.field, entry.nextValue))}</td>
        </tr>
      `
    )
    .join("");
}

function formatHistoryValue(field, value) {
  if (!valueExists(value)) return "-";
  if (field === "assignedUserId" || field === "callUpdatedByUserId") return getUserName(value) || "-";
  if (field === "isHidden") return parseHiddenValue(value) ? "非表示" : "表示";
  if (field === "callUpdatedAt") return formatDateTime(value);
  if (field === "lastContactDate" || field === "considerationDate" || field === "nextActionDate") return formatDate(value);
  if (field === "notificationLeadDays") return `${normalizeNotificationLeadDays(value)}日前`;
  const stringValue = String(value);
  return stringValue.length > 80 ? `${stringValue.slice(0, 80)}...` : stringValue;
}

async function enableNotifications() {
  if (!supportsNotifications()) {
    notificationSettings.enabled = false;
    saveNotificationSettings();
    renderNotificationPanel("このブラウザは通知に対応していません。", "warning");
    return;
  }

  setNotificationButtonBusy(true);

  try {
    let permission = window.Notification.permission || "default";
    if (permission !== "granted" && permission !== "denied") {
      permission = await requestBrowserNotificationPermission();
    }

    if (permission !== "granted") {
      notificationSettings.enabled = false;
      saveNotificationSettings();
      const message =
        permission === "denied"
          ? "通知がブロックされています。ブラウザのサイト設定で通知を許可してください。"
          : "通知許可が完了していません。ブラウザの許可ダイアログで「許可」を選んでください。";
      renderNotificationPanel(message, permission === "denied" ? "error" : "warning");
      return;
    }

    notificationSettings.enabled = true;
    saveNotificationSettings();
    const result = checkCallNotifications(true);
    markSaved("通知設定を保存しました");

    if (result.failed) {
      renderNotificationPanel("ブラウザ通知の表示に失敗しました。ブラウザまたはOS側の通知設定を確認してください。", "error");
    } else if (result.sent) {
      renderNotificationPanel(`${result.sent}件の架電通知を送信しました。`, "success");
    } else {
      renderNotificationPanel("通知を有効化しました。近日の架電予定はありません。", "success");
    }
  } catch {
    notificationSettings.enabled = false;
    saveNotificationSettings();
    renderNotificationPanel("通知許可の取得に失敗しました。ブラウザのサイト設定から通知を許可してください。", "error");
  } finally {
    setNotificationButtonBusy(false);
  }
}

function updateNotificationSettings() {
  notificationSettings.leadDays = Number(elements.notificationLeadDays?.value ?? 3);
  notificationSettings.popupLeadDays = Number(elements.notificationPopupLeadDays?.value ?? notificationSettings.leadDays ?? 3);
  notificationSettings.displayMode = normalizeNotificationDisplayMode(elements.notificationDisplayMode?.value);
  notificationSettings.scope = normalizeNotificationScope(elements.notificationScope?.value);
  notificationSettings.dismissCondition = elements.notificationDismissCondition?.value ?? "nextActionDate";
  saveNotificationSettings();
  markSaved("通知設定を保存しました");
  renderNotificationPanel();
  checkCallNotifications(false);
}

function checkCallNotifications(force) {
  const result = { sent: 0, failed: 0, skipped: 0, candidates: 0 };
  if (!notificationSettings.enabled || !supportsNotifications() || window.Notification.permission !== "granted") {
    return result;
  }

  const upcoming = getUpcomingCalls(Number(notificationSettings.popupLeadDays ?? notificationSettings.leadDays ?? 3));
  result.candidates = upcoming.length;
  let changed = false;

  for (const venue of upcoming) {
    const key = notificationStateKey(venue);
    if (!force && notificationSettings.notified[key]) {
      result.skipped += 1;
      continue;
    }

    try {
      new window.Notification("架電予定が近づいています", {
        body: `${venue.facilityName || "名称未設定"} / ${formatDate(venue.nextActionDate)} / ${venue.nextAction || "次回架電"}`,
      });
      notificationSettings.notified[key] = new Date().toISOString();
      result.sent += 1;
      changed = true;
    } catch {
      notificationSettings.enabled = false;
      result.failed += 1;
      changed = true;
      break;
    }
  }

  if (changed) saveNotificationSettings();
  if (result.failed) {
    renderNotificationPanel("ブラウザ通知の表示に失敗しました。ブラウザまたはOS側の通知設定を確認してください。", "error");
  }
  return result;
}

function getUpcomingCalls(fallbackLeadDays = getDefaultNotificationLeadDays()) {
  const today = startOfDay(new Date());

  return getNotificationTargetVenues()
    .filter((venue) => {
      if (!venue.nextActionDate || isClosedForCalls(venue) || isVenueHidden(venue)) return false;
      if (isNotificationDismissed(venue)) return false;
      const callDate = startOfDay(new Date(venue.nextActionDate));
      if (Number.isNaN(callDate.getTime())) return false;
      const leadDays = getVenueNotificationLeadDays(venue, fallbackLeadDays);
      const end = addDays(today, leadDays);
      const days = daysBetween(today, callDate);
      return callDate <= end && days >= -7;
    })
    .sort((a, b) => (a.nextActionDate || "").localeCompare(b.nextActionDate || ""));
}

function getNotificationTargetVenues() {
  return getNotificationScope() === "all" ? venues : venues.filter((venue) => isVenueInNotificationScope(venue));
}

function isVenueInNotificationScope(venue) {
  return getNotificationScope() === "all" || venue?.assignedUserId === currentUserId;
}

function supportsNotifications() {
  return "Notification" in window;
}

function getNotificationButtonText(support, permission) {
  if (!support) return "通知非対応";
  if (permission === "denied") return "設定を確認";
  if (permission === "granted" && notificationSettings.enabled) return "再チェック";
  if (permission === "granted") return "通知をON";
  return "通知を有効化";
}

function getNotificationHelpMessage(support, permission) {
  if (!support) return "このブラウザは通知に対応していません。";
  if (permission === "denied") return "通知がブロックされています。ブラウザのサイト設定で通知を許可してください。";
  if (permission === "granted" && notificationSettings.enabled) {
    return `通知は有効です。${notificationScopes[getNotificationScope()]}を、ページを開いている間に約1分ごとに確認します。`;
  }
  if (permission === "granted") return "ブラウザ側の許可は済んでいます。ボタンでこのアプリの通知をONにできます。";
  return "ボタンを押すと、ブラウザの通知許可を確認します。";
}

function getNotificationHelpTone(support, permission) {
  if (!support) return "warning";
  if (permission === "denied") return "error";
  if (permission === "granted" && notificationSettings.enabled) return "success";
  return "";
}

function setNotificationButtonBusy(isBusy) {
  if (!elements.enableNotificationsButton) return;
  elements.enableNotificationsButton.disabled = isBusy || !supportsNotifications();
  if (isBusy) elements.enableNotificationsButton.textContent = "確認中";
}

function requestBrowserNotificationPermission() {
  return new Promise((resolve, reject) => {
    try {
      const request = window.Notification.requestPermission;
      if (typeof request !== "function") {
        resolve(window.Notification.permission || "default");
        return;
      }

      const result = request.call(window.Notification, (permission) => resolve(permission));
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      } else if (typeof result === "string") {
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function getDefaultNotificationLeadDays() {
  return normalizeNotificationLeadDays(notificationSettings.leadDays) || "3";
}

function getVenueNotificationLeadDays(venue, fallbackLeadDays = getDefaultNotificationLeadDays()) {
  const venueLeadDays = normalizeNotificationLeadDays(venue?.notificationLeadDays);
  const fallback = normalizeNotificationLeadDays(fallbackLeadDays) || getDefaultNotificationLeadDays();
  return Number(venueLeadDays || fallback);
}

function notificationLeadDaysText(venue) {
  const venueLeadDays = normalizeNotificationLeadDays(venue?.notificationLeadDays);
  if (valueExists(venueLeadDays)) return `${venueLeadDays}日前`;
  return `共通設定（${getDefaultNotificationLeadDays()}日前）`;
}

function getNotificationDisplayMode() {
  return normalizeNotificationDisplayMode(notificationSettings.displayMode);
}

function normalizeNotificationDisplayMode(value) {
  return Object.hasOwn(notificationDisplayModes, value) ? value : "badge";
}

function getNotificationScope() {
  return normalizeNotificationScope(notificationSettings.scope);
}

function getDefaultNotificationScope(userId = currentUserId) {
  const user = users.find((item) => item.id === userId);
  return user?.role === "admin" ? "all" : "assigned";
}

function normalizeNotificationScope(value) {
  return Object.hasOwn(notificationScopes, value) ? value : "assigned";
}

function notificationStateKey(venue) {
  return `${venue.id}:${venue.nextActionDate || ""}:${venue.status || ""}:${getVenueNotificationLeadDays(venue)}`;
}

function isNotificationDismissed(venue) {
  return Boolean(notificationSettings.dismissed?.[notificationStateKey(venue)]);
}

function isSameVenue(a, b) {
  const sameName = normalize(a.facilityName) && normalize(a.facilityName) === normalize(b.facilityName);
  const samePhone = normalizeDigits(a.phone) && normalizeDigits(a.phone) === normalizeDigits(b.phone);
  const sameAddress = normalize(a.address) && normalize(a.address) === normalize(b.address);
  return sameName && (samePhone || sameAddress || normalize(a.municipality) === normalize(b.municipality));
}

function removeEmptyValues(source) {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => valueExists(value)));
}

function infoItem(label, value, mode = "text") {
  let rendered = "-";
  if (mode === "html") {
    rendered = value || "-";
  } else if (mode === "mailto" && valueExists(value)) {
    rendered = `<a href="mailto:${escapeAttribute(value)}">${escapeHtml(value)}</a>`;
  } else if (mode === "url" && valueExists(value)) {
    const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    rendered = `<a href="${escapeAttribute(href)}" target="_blank" rel="noreferrer">${escapeHtml(value)}</a>`;
  } else if (valueExists(value)) {
    rendered = `<strong>${escapeHtml(value)}</strong>`;
  }

  return `<div class="info-item"><span>${escapeHtml(label)}</span>${rendered}</div>`;
}

function statusMarkup(status = "未着手", id = "") {
  const className = [
    "status-pill",
    getStatusMeta(status).isClosed ? "is-closed" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const idAttribute = id ? ` id="${id}"` : "";
  return `<span${idAttribute} class="${className}"${statusStyleAttribute(status)}>${escapeHtml(status || "未着手")}</span>`;
}

function temperaturePillMarkup(level = "B") {
  const temperature = normalizeTemperatureValue(level);
  return `<span class="temperature-pill"${temperatureStyleAttribute(temperature)}>${escapeHtml(temperatureOptionText(temperature))}</span>`;
}

function callStatusMarkup(venue) {
  if (!venue.callUpdatedAt) return '<span class="call-status-pill uncalled">未架電</span>';
  return `<span class="call-status-pill called">最終更新 ${escapeHtml(formatDateTime(venue.callUpdatedAt))}</span>`;
}

function callStatusText(venue) {
  return venue.callUpdatedAt ? `最終更新 ${formatDateTime(venue.callUpdatedAt)}` : "未架電";
}

function callDateClass(venue) {
  if (!venue.nextActionDate || isClosedForCalls(venue) || isVenueHidden(venue)) return "";
  const today = startOfDay(new Date());
  const callDate = startOfDay(new Date(venue.nextActionDate));
  if (Number.isNaN(callDate.getTime())) return "";
  const days = daysBetween(today, callDate);
  if (days < 0) return "overdue";
  if (days <= getVenueNotificationLeadDays(venue)) return "soon";
  return "";
}

function callDateMarkup(venue) {
  if (!venue.nextActionDate) return "-";
  const label = formatDate(venue.nextActionDate);
  const dateClass = callDateClass(venue);
  const className = dateClass ? `date-pill ${dateClass}` : "";
  return className ? `<span class="${className}">${escapeHtml(label)}</span>` : escapeHtml(label);
}

function notificationBadgeMarkup(venue) {
  const level = getNotificationLevel(venue);
  const leadDays = getVenueNotificationLeadDays(venue);
  if (!level) return `<span class="notify-badge muted" title="${escapeAttribute(`${leadDays}日前の通知対象外`)}">-</span>`;

  const labels = {
    1: "期限当日または超過",
    2: "1日以内",
    3: `${leadDays}日以内`,
  };
  const badge = `<span class="notify-badge level-${level}" title="${escapeAttribute(labels[level])}" aria-label="${escapeAttribute(labels[level])}">${toCircledNumber(level)}</span>`;
  const daysText = notificationRemainingText(venue);
  const mode = getNotificationDisplayMode();

  if (mode === "badgeDays") {
    return `<span class="notification-cell-display">${badge}<span class="notify-text-pill">${escapeHtml(daysText)}</span></span>`;
  }
  if (mode === "days") {
    return `<span class="notify-text-pill level-${level}" title="${escapeAttribute(labels[level])}">${escapeHtml(daysText)}</span>`;
  }
  if (mode === "date") {
    return `<span class="notify-text-pill level-${level}" title="${escapeAttribute(labels[level])}">${escapeHtml(formatDate(venue.nextActionDate))}</span>`;
  }
  return badge;
}

function getNotificationLevel(venue) {
  if (!venue.nextActionDate || isClosedForCalls(venue) || isVenueHidden(venue)) return 0;
  if (!isVenueInNotificationScope(venue) || isNotificationDismissed(venue)) return 0;
  const today = startOfDay(new Date());
  const callDate = startOfDay(new Date(venue.nextActionDate));
  if (Number.isNaN(callDate.getTime())) return 0;
  const days = daysBetween(today, callDate);
  const leadDays = getVenueNotificationLeadDays(venue);
  if (days < -7) return 0;
  if (days <= 0) return 1;
  if (days === 1 && leadDays >= 1) return 2;
  if (days <= leadDays) return 3;
  return 0;
}

function notificationSortScore(venue) {
  const level = getNotificationLevel(venue);
  return level ? 4 - level : 0;
}

function notificationRemainingText(venue) {
  const days = daysUntilNextAction(venue);
  if (days === null) return "-";
  if (days < 0) return `${Math.abs(days)}日超過`;
  if (days === 0) return "今日";
  if (days === 1) return "明日";
  return `${days}日後`;
}

function daysUntilNextAction(venue) {
  if (!venue?.nextActionDate) return null;
  const today = startOfDay(new Date());
  const callDate = startOfDay(new Date(venue.nextActionDate));
  if (Number.isNaN(callDate.getTime())) return null;
  return daysBetween(today, callDate);
}

function toCircledNumber(value) {
  const circledNumbers = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨"];
  return circledNumbers[Number(value)] || String(value);
}

function isClosedForCalls(venue) {
  return getStatusMeta(venue?.status).isClosed;
}

function isVenueHidden(venue) {
  return parseHiddenValue(venue?.isHidden);
}

function parseHiddenValue(value) {
  if (value === true) return true;
  const normalizedValue = normalize(value);
  return ["true", "1", "yes", "on", "非表示", "hidden", "hide"].includes(normalizedValue);
}

function parseImportantNoteValue(value) {
  if (value === true) return true;
  const normalizedValue = normalize(value);
  return ["true", "1", "yes", "on", "重要", "重要メモ", "important", "importantnote"].includes(normalizedValue);
}

function normalizeTemperatureValue(value, fallback = "B") {
  const normalizedValue = String(value ?? "").trim().toUpperCase();
  const numberMap = {
    "5": "A",
    "4": "B",
    "3": "C",
    "2": "D",
    "1": "E",
  };
  const nextValue = numberMap[normalizedValue] || normalizedValue;
  return priorities.includes(nextValue) ? nextValue : fallback;
}

function normalizeRatingValue(value) {
  return normalizeTemperatureValue(value, "C");
}

function normalizeProgramPolicyValue(value) {
  const normalizedValue = normalize(value);
  if (!normalizedValue) return "△";
  if (["○", "〇", "o", "ok", "yes", "true", "1"].includes(normalizedValue)) return "○";
  if (["△", "未確認", "不明", "検討中", "一部", "保留"].includes(normalizedValue)) return "△";
  if (["×", "x", "ng", "no", "false", "0"].includes(normalizedValue)) return "×";
  if (normalizedValue.includes("あり") || normalizedValue.includes("有") || normalizedValue.includes("実施")) return "○";
  if (normalizedValue.includes("なし") || normalizedValue.includes("無し") || normalizedValue.includes("無")) return "×";
  if (normalizedValue.includes("未") || normalizedValue.includes("不明") || normalizedValue.includes("確認")) return "△";
  return "○";
}

function normalizeNotificationLeadDays(value) {
  const stringValue = String(value ?? "").trim();
  if (!stringValue) return "";
  const numberValue = Number.parseInt(stringValue, 10);
  if (!Number.isFinite(numberValue) || numberValue < 0) return "";
  return String(Math.min(numberValue, 365));
}

function temperatureScore(value) {
  const temperature = normalizeTemperatureValue(value, "E");
  return priorities.length - priorities.indexOf(temperature);
}

function getCallDateFromConsideration(value) {
  const normalizedDate = normalizeDate(value);
  if (!normalizedDate) return "";
  return addMonths(normalizedDate, -2);
}

function normalizeHallScaleValues(source) {
  const next = {
    ...source,
    seatCount: normalizeDigits(source?.seatCount ?? ""),
    largeHallSeats: normalizeDigits(source?.largeHallSeats ?? ""),
    mediumHallSeats: normalizeDigits(source?.mediumHallSeats ?? ""),
    smallHallSeats: normalizeDigits(source?.smallHallSeats ?? ""),
  };

  if (!next.largeHallSeats) {
    const filledSpecificHalls = [
      ["mediumHallSeats", next.mediumHallSeats],
      ["smallHallSeats", next.smallHallSeats],
    ].filter(([, value]) => valueExists(value));

    if (filledSpecificHalls.length === 1) {
      const [field, value] = filledSpecificHalls[0];
      next.largeHallSeats = value;
      next[field] = "";
    } else if (next.seatCount) {
      next.largeHallSeats = next.seatCount;
    }
  }

  return next;
}

function hallScaleText(venue) {
  const values = [
    ["大", venue.largeHallSeats || venue.seatCount],
    ["中", venue.mediumHallSeats],
    ["小", venue.smallHallSeats],
  ].filter(([, value]) => valueExists(value));

  return values.length ? values.map(([label, value]) => `${label}: ${value}`).join(" / ") : "";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeDate(value) {
  if (!value) return "";
  const trimmed = String(value).trim().replaceAll("/", "-");
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeDateTime(value) {
  if (!value) return "";
  const trimmed = String(value).trim().replaceAll("/", "-");
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(value, months) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const maxDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(date.getDate(), maxDay));
  return [
    next.getFullYear(),
    String(next.getMonth() + 1).padStart(2, "0"),
    String(next.getDate()).padStart(2, "0"),
  ].join("-");
}

function daysBetween(start, end) {
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function normalize(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, "");
}

function normalizeHeader(value = "") {
  return normalize(stripBom(value)).replace(/[＿_\-ー:：]/g, "");
}

function normalizeDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function valueExists(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function truncateText(value, maxLength = 36) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function unique(values) {
  return [...new Set(values)];
}

function localeSort(a, b) {
  return a.localeCompare(b, "ja");
}

function comparePrefectureNames(a, b) {
  const indexA = prefectureSortIndex(a);
  const indexB = prefectureSortIndex(b);
  if (indexA !== indexB) return indexA - indexB;
  return String(a || "").localeCompare(String(b || ""), "ja");
}

function prefectureSortIndex(value) {
  const prefecture = normalizePrefecture(value);
  const index = japanPrefectures.indexOf(prefecture);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function escapeCsvCell(value) {
  const stringValue = String(value ?? "");
  return /[",\r\n]/.test(stringValue) ? `"${stringValue.replaceAll('"', '""')}"` : stringValue;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function stripBom(value = "") {
  return String(value).replace(/^\uFEFF/, "");
}

function notifyMessage(message) {
  if (window.alert) {
    window.alert(message);
  } else {
    console.warn(message);
  }
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `venue-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
