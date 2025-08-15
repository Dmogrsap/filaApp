export interface Song {
  id?: string;
  title: string;
  lyrics: string; // Puede incluir acordes en formato [C], [G], etc.
  chords?: string[]; // Opcional: lista de acordes usados
  selectedForSunday?: boolean;
  createdAt?: Date;
}
