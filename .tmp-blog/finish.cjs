const fs=require('fs');const p='src/pages/blog/[slug].astro';let s=fs.readFileSync(p,'utf8');s=s.replace('</style>',fs.readFileSync('.tmp-blog/article.css','utf8')+'\n</style>');fs.writeFileSync(p,s);
const rich='src/components/blog/portable/PortableTextBlock.astro';s=fs.readFileSync(rich,'utf8');s=s.replace('</style>',`
  :global(.portable-heading) { font-family: var(--font-sans); font-weight: 600; letter-spacing: -.02em; line-height: 1.25; text-transform: none; scroll-margin-top: 6rem; }
  :global(.portable-h2) { font-size: var(--text-title); }
  :global(.portable-h3) { font-size: 1.375rem; }
  :global(.portable-h4) { font-size: 1.125rem; }
  :global(.portable-paragraph), :global(.portable-list-bullet), :global(.portable-list-number) { font-size: 1.0625rem; line-height: 1.8; color: var(--color-ink-soft); }
  :global(.portable-blockquote) { border-color: var(--color-brand); background: var(--color-brand-25); padding: 1.5rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; }
  :global(.portable-highlight) { background: var(--color-brand-wash); }
</style>`);fs.writeFileSync(rich,s);
const index='src/pages/blog/index.astro';s=fs.readFileSync(index,'utf8');s=s.replace(/    <script\s+src="https:\/\/unpkg.com\/@lottiefiles[\s\S]*?<\/script>/,'');
s=s.replace(/<lottie-player[\s\S]*?<\/lottie-player>/,'<span class="text-brand text-2xl" aria-hidden="true">✓</span>');
s=s.replace(/          const lottie = document.getElementById\('nl-lottie'\);\s*lottie\?\.stop\(\);\s*lottie\?\.play\(\);/,'');
s=s.replace('border-b-[4px] border-[#00ff7b] bg-[#000000]','rounded-lg border border-brand-soft bg-surface shadow-lg');
s=s.replaceAll("font-['Barlow_Condensed']",'font-sans').replaceAll("font-['DM_Sans']",'font-sans').replaceAll('text-[var(--color-surface)]','text-ink').replaceAll('text-[var(--color-ink-muted)]','text-ink-muted').replaceAll('hover:text-[var(--color-surface)]','hover:text-brand');
s=s.replace('!hasPosts && (','!hasPosts && !blogErrorMessage && (');
fs.writeFileSync(index,s);
