export interface Article {
  id: number;
  title: string;
  body: string;
  category_id: number;
  submitter_id: number;
}

export interface ArticleWithNames extends Article {
  category_name: string;
  submitter_name: string;
}
