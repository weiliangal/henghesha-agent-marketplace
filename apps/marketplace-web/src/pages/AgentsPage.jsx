import { Blocks, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client";
import AgentCard from "../components/AgentCard";
import AgentSkeleton from "../components/AgentSkeleton";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";

const categories = ["全部", "教育", "企业", "文旅", "定制"];
const priceRanges = [
  { value: "all", label: "全部价格" },
  { value: "0-100000", label: "10 万以下" },
  { value: "100000-150000", label: "10-15 万" },
  { value: "150000-999999999", label: "15 万以上" },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [category, setCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState("latest");
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);
  const [, startTransition] = useTransition();
  const pageSize = 6;

  useEffect(() => {
    apiRequest("/agents")
      .then((data) => {
        startTransition(() => setAgents(data.agents || []));
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();

    return [...agents]
      .filter((agent) => {
        const categoryPass = category === "全部" || agent.category === category;
        const searchPass = !term || [agent.name, agent.summary, agent.description].join(" ").toLowerCase().includes(term);

        let pricePass = true;
        if (priceRange !== "all") {
          const [min, max] = priceRange.split("-").map(Number);
          pricePass = agent.price >= min && agent.price <= max;
        }

        return categoryPass && searchPass && pricePass;
      })
      .sort((left, right) => {
        if (sortMode === "price-asc") {
          return left.price - right.price;
        }
        if (sortMode === "price-desc") {
          return right.price - left.price;
        }
        return right.id - left.id;
      });
  }, [agents, category, deferredSearch, priceRange, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [category, search, sortMode, priceRange]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const currentPageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const averagePrice = filtered.length ? Math.round(filtered.reduce((sum, item) => sum + item.price, 0) / filtered.length / 100) : 0;

  return (
    <section className="section-shell">
      <div className="hero-panel p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-end">
          <div>
            <SectionHeader
              eyebrow="智能体库"
              title="像国际产品目录一样清晰地浏览、比较和筛选智能体"
              description="这里集中展示已审核上线的智能体。你可以按行业、价格区间和关键词快速比较，也可以先去模板中心再回来绑定具体方案。"
              action={
                <Link to="/templates" className="button-secondary">
                  去模板中心
                </Link>
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <InfoTile label="当前结果" value={`${filtered.length}`} />
            <InfoTile label="推荐项目" value={`${filtered.filter((item) => item.featured).length}`} />
            <InfoTile label="均价参考" value={averagePrice ? `¥${averagePrice.toLocaleString("zh-CN")}` : "--"} />
          </div>
        </div>
      </div>

      <div className="mt-8 section-tint p-5 sm:p-6">
        <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_220px] xl:grid-cols-[1fr_220px_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/32" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索教育、企业、文旅或定制智能体"
              className="input-base pl-11"
            />
          </div>

          <div className="flex items-center gap-2 rounded-[1.35rem] border border-white/80 bg-white/82 px-4 py-3 text-sm font-medium text-ink/62">
            <SlidersHorizontal size={16} />
            共 {filtered.length} 个结果
          </div>

          <select className="input-base" value={priceRange} onChange={(event) => setPriceRange(event.target.value)}>
            {priceRanges.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select className="input-base" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="latest">按最新上架</option>
            <option value="price-asc">价格从低到高</option>
            <option value="price-desc">价格从高到低</option>
          </select>
        </div>

        <div className="relative z-10 mt-5 flex flex-wrap gap-3">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`pill-filter ${category === item ? "bg-ink text-white" : "border border-white/80 bg-white/82 text-ink/68 hover:text-ink"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <AgentSkeleton key={index} />)
        ) : currentPageItems.length ? (
          currentPageItems.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState
              title="没有找到匹配的智能体"
              description="可以调整关键词、切换分类和价格区间，或者先去模板中心看看更合适的标准方案。"
              action={
                <Link to="/templates" className="button-primary">
                  查看模板中心
                </Link>
              }
            />
          </div>
        )}
      </div>

      {filtered.length ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-ink/58">
            第 {page} / {totalPages} 页
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="button-secondary" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              上一页
            </button>
            <button
              type="button"
              className="button-secondary"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              下一页
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        <SubtleNote
          icon={<Sparkles size={17} />}
          title="统一的卡片结构"
          text="分类、供给方、价格、审核状态和详情入口都保持一致，便于企业快速比较。"
        />
        <SubtleNote
          icon={<SlidersHorizontal size={17} />}
          title="更成熟的筛选面板"
          text="搜索、分类、价格区间和排序集中在一层里，页面更接近真实 SaaS 产品目录。"
        />
        <SubtleNote
          icon={<Blocks size={17} />}
          title="先模板后绑定"
          text="如果一时拿不准具体智能体，也可以先从模板中心选方案，再回来绑定现货项目。"
        />
      </div>
    </section>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="glass-card p-5">
      <div className="text-sm text-ink/52">{label}</div>
      <div className="mt-3 font-display text-3xl font-semibold text-ink">{value}</div>
    </div>
  );
}

function SubtleNote({ icon, title, text }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-sky">{icon}</span>
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-ink/64">{text}</p>
    </div>
  );
}
