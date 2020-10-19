export interface SettingsObject {
  id:         string;
  actorList?: boolean;
  data:       Data[];
}

export interface Data {
  name?:      string;
  icon?:      string;
  iconColor?: string;
  path?:      string;
  rowName?:   string;
  rowData?:   RowData[];
}

export interface RowData {
  name:       string;
  icon?:      string;
  iconColor?: string;
  path:       string;
}
