import { angelina } from "@/components/layouts/local-fonts";
import { about } from "@/data/about";
import { cn } from "@/lib/utils";

const About = () => {
  return (
    <section className="flex flex-col items-center justify-center rounded border border-zinc-500/60 p-8">
      <h1
        className={cn(
          angelina.className,
          "mb-4 text-4xl leading-16 font-bold text-purple-500 capitalize",
        )}
      >
        {about.title}
      </h1>
      <p className="text-muted-foreground mb-4 text-center text-xl tracking-wider text-balance">
        {about.quote}
      </p>
      <div className="my-8 flex w-full justify-between px-8">
        {about.highlights.map((highlight) => (
          <div className="border-l border-purple-500 px-8" key={highlight.label}>
            <h2 className="mb-2 text-3xl leading-10">{highlight.label}</h2>
            <p className="text-md text-muted-foreground">{highlight.description}</p>
          </div>
        ))}
      </div>
      <div className="text-muted-foreground flex gap-8 text-justify leading-6">
        <p>{about.description}</p>
      </div>
    </section>
  );
};

export default About;
