const fs=require('fs');
const files=['src/pages/blog/index.astro','src/pages/blog/[slug].astro',...fs.readdirSync('src/components/blog/portable').map(n=>'src/components/blog/portable/'+n),'src/components/blog/BlogCard.astro'];
for(const p of files){let s=fs.readFileSync(p,'utf8');
s=s.replace(/font-family: 'Bebas Neue', sans-serif;/g,'font-family: var(--font-sans);\n    font-weight: 600;').replace(/font-family: '(Barlow Condensed|DM Sans)', sans-serif;/g,'font-family: var(--font-sans);').replace(/font-family: 'Geist Mono', monospace;/g,'font-family: var(--font-mono);');
s=s.replace(/#2b2ba820/gi,'var(--color-brand-wash)').replace(/#2b2ba8/gi,'var(--color-brand)').replace(/#f6f4ef/gi,'var(--color-surface)').replace(/#111120/gi,'var(--color-ink)').replace(/#8a8a9e/gi,'var(--color-ink-muted)').replace(/#2f2f2f|#4c4c63/gi,'var(--color-ink-soft)').replace(/#e8e6df/gi,'var(--color-surface-alt-2)').replace(/#d5d3cc/gi,'var(--color-neutral-100)');
s=s.replace(/rgba\(43,\s*43,\s*168,\s*([\d.]+)\)/g,(_,a)=>`color-mix(in srgb, var(--color-brand) ${Number(a)*100}%, transparent)`).replace(/rgba\(17,\s*17,\s*32,\s*([\d.]+)\)/g,(_,a)=>`color-mix(in srgb, var(--color-ink) ${Number(a)*100}%, transparent)`);
s=s.replace(/font-weight: 300;/g,'font-weight: 400;').replace(/letter-spacing: 0\.(1[2-9]|2\d)em;/g,'letter-spacing: 0.04em;').replace(/line-height: 0\.\d+;/g,'line-height: 1.2;').replace(/font-size: (9|10|11|11\.5)px;/g,'font-size: 0.75rem;');
if(p.includes('src/pages/blog/')){
s=s.replace("import RiseLogo from '../../assets/shared/rise-logo.svg';","import BlogHeader from '../../components/blog/BlogHeader.astro';");
s=s.replace(/    <link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>[\s\S]*?rel="stylesheet"\s*\/>/,'');
s=s.replace(/    <header class="topbar">[\s\S]*?<\/header>/,'    <BlogHeader />');
s=s.replace('<main>','<main id="conteudo" class="ds-shell">');
if(p.includes('[slug]')){
s=s.replace("import BlogHeader", "import Footer from '../../sections/footer/Footer.astro';\nimport BlogHeader");
s=s.replace('    <article>','    <main id="conteudo" class="ds-shell">\n    <article>');
s=s.replace('    </article>\n  </div>', '    </article>\n    </main>\n    <Footer />\n  </div>');
s=s.replace('  :root {','  .blog-shell {');
s=s.replace('<script type="application/ld+json"','<script is:inline type="application/ld+json"');
}
}
fs.writeFileSync(p,s);
}
