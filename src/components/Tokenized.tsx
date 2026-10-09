import { pseudoTokenize } from "@/lib/tokenize";

// Renders text as subword tokens. Tokens tint when an ancestor with the
// `tok-group` class is hovered (see globals.css).
export default function Tokenized({ text }: { text: string }) {
  return (
    <>
      {pseudoTokenize(text).map((token, i) => (
        <span key={i} className={`tok tok-${i % 5}`}>
          {token}
        </span>
      ))}
    </>
  );
}
