import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { StartTemplateButton } from "@/components/StartTemplateButton";
import { TONE, cx } from "@/components/ui";
import { TEMPLATE_GUIDES, guideBySlug } from "@/lib/templateContent";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return TEMPLATE_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata(
  props: PageProps<"/templates/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = guideBySlug(slug);
  if (!guide) return { title: "Template not found", robots: { index: false } };

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/templates/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `${siteUrl()}/templates/${guide.slug}`,
    },
  };
}

export default async function TemplatePage(props: PageProps<"/templates/[slug]">) {
  const { slug } = await props.params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const others = TEMPLATE_GUIDES.filter((other) => other.slug !== guide.slug);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to run a ${guide.name} retrospective`,
    description: guide.description,
    url: `${siteUrl()}/templates/${guide.slug}`,
    step: guide.running.map((row, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: row.step,
      text: row.step,
    })),
  };

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-8 pb-20 sm:px-6 sm:pt-12 sm:pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-8 text-[12px] text-mist-700">
        <Link href="/templates" className="hover:text-mist-300">
          Templates
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-mist-500">{guide.name}</span>
      </nav>

      <h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-tight text-mist-100 sm:text-[2.75rem]">
        {guide.name} retrospective
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-mist-500">{guide.intro}</p>

      <div className="mt-6" id="start">
        <StartTemplateButton
          template={guide.templateId}
          defaultTitle={`${guide.name} retro`}
          cta="Start board →"
        />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        The columns
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {guide.columns.map((column) => (
          <div key={column.title} className="surface rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2.5">
              <span className={cx("h-2 w-2 rounded-full", TONE[column.tone].dot)} />
              <h3 className="text-[15px] font-semibold text-mist-100">{column.title}</h3>
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-mist-300">{column.what}</p>
            <p className="mt-3 text-[13px] text-mist-500">
              <span className="font-semibold text-mist-300">Ask:</span> {column.prompt}
            </p>
            <p className="mt-1.5 rounded-lg border border-line bg-fill-1 px-3 py-2 font-mono text-[12px] text-mist-500">
              {column.example}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        When to use it
      </h2>
      <ul className="mt-4 flex flex-col gap-2">
        {guide.bestFor.map((item) => (
          <li key={item} className="flex gap-2.5 text-[14px] leading-relaxed text-mist-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-tone-positive" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-2xl border border-tone-idea/20 bg-tone-idea/6 px-4 py-3 text-[13px] leading-relaxed text-mist-300">
        <span className="font-semibold text-tone-idea">When not to: </span>
        {guide.avoid}
      </p>
      <p className="mt-4 text-[13px] leading-relaxed text-mist-700">{guide.origin}</p>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Running it
      </h2>
      <ol className="mt-4 flex flex-col gap-2">
        {guide.running.map((row, index) => (
          <li key={row.step} className="surface flex items-baseline gap-3 rounded-xl px-4 py-3">
            <span className="font-mono text-[11px] text-mist-700">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1 text-[14px] leading-relaxed text-mist-300">{row.step}</span>
            <span className="shrink-0 text-[11px] tabular-nums text-mist-700">{row.time}</span>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Facilitation notes
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {guide.tips.map((tip) => (
          <p key={tip} className="surface rounded-2xl p-4 text-[14px] leading-relaxed text-mist-300">
            {tip}
          </p>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Common questions
      </h2>
      <div className="mt-4 flex flex-col gap-2">
        {guide.faq.map((item) => (
          <details key={item.q} className="surface group rounded-2xl p-4">
            <summary className="cursor-pointer list-none text-[14px] font-semibold text-mist-100 marker:content-none">
              <span className="mr-2 inline-block text-mist-700 transition-transform group-open:rotate-90">›</span>
              {item.q}
            </summary>
            <p className="mt-2 pl-5 text-[13px] leading-relaxed text-mist-300">{item.a}</p>
          </details>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight text-mist-100">
        Other formats
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {others.map((other) => (
          <Link
            key={other.slug}
            href={`/templates/${other.slug}`}
            className="surface rounded-2xl p-4 transition-colors hover:border-line-strong"
          >
            <span className="flex gap-1">
              {other.columns.map((column) => (
                <span key={column.title} className={cx("h-1.5 w-1.5 rounded-full", TONE[column.tone].dot)} />
              ))}
            </span>
            <p className="mt-2 text-[13px] font-medium text-mist-100">{other.name}</p>
          </Link>
        ))}
      </div>

      <div className="surface mt-12 rounded-2xl p-5 text-center">
        <p className="text-[15px] font-semibold text-mist-100">
          Run a {guide.name} retro now
        </p>
        <p className="mt-1.5 text-[13px] text-mist-500">
          Columns ready, link shareable, nothing to install.
        </p>
        <a
          href="#start"
          className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-6 text-sm font-medium text-white transition-colors hover:bg-accent-soft"
        >
          Start a board →
        </a>
        <p className="mt-3 text-[12px] text-mist-700">
          Need different columns?{" "}
          <Link href="/new" className="text-accent-soft underline decoration-accent/40 underline-offset-2 hover:decoration-accent">
            Build a custom board
          </Link>
        </p>
      </div>
    </main>
  );
}
