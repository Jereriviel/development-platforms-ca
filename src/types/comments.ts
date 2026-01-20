export interface Comment {
  id: number;
  content: string;
  article_id: number;
  user_id: number;
}

export interface CommentWithName extends Comment {
  user_name: string;
}
