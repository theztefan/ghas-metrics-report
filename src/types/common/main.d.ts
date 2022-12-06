type input = {
  title: string;
  labels: string[];
  path: string;
  issueID: number | undefined;
  columnID: number | undefined;
  column: string;
  cardType: string;
};

type file = input[];

type inputsReturned = {
  repo: string;
  doc: file;
  name: string;
  columns: string;
};

type projectColumnData = {
  name: string;
  id: number;
};

type projectColumnDataArray = projectColumnData[];
