export default function SectionHeader({ eyebrow, title, description, align = "left", action = null }) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "flex flex-col gap-5 md:flex-row md:items-end md:justify-between"}>
      <div className={centered ? "" : "max-w-3xl"}>
        {eyebrow ? <div className="data-chip">{eyebrow}</div> : null}
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">{title}</h2>
        {description ? <p className="mt-4 text-base leading-8 text-ink/66">{description}</p> : null}
      </div>
      {action ? (
        <div className={centered ? "mt-6 flex justify-center" : "md:shrink-0"}>
          {action}
        </div>
      ) : null}
    </div>
  );
}
