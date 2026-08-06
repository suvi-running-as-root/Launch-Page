export default function ProgramPage({ eyebrow, title, intro, image, imageAlt, sourceUrl, children }) {
  return <article className="program-page"><div className="page-hero"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></div>{image && <img src={image} alt={imageAlt} />}</div><div className="program-content">{children}{sourceUrl && <p className="program-source"><a href={sourceUrl} target="_blank" rel="noreferrer">Learn more from Amar Seva Sangam India →</a></p>}</div></article>;
}
