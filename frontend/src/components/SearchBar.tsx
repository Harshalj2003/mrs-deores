import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ArrowRight, Package2, LayoutGrid, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

interface SearchResult {
    type: 'product' | 'category';
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    mrp?: number;
    categoryName?: string;
    path: string;
}

// Pages where search is completely hidden
const HIDDEN_PATHS = ['/admin', '/checkout', '/login', '/register', '/forgot-password', '/reset-password'];

interface SearchBarProps {
    mode: 'expanded' | 'compact';
}

const SearchBar: React.FC<SearchBarProps> = ({ mode }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [compactOpen, setCompactOpen] = useState(false);
    const [selectedIdx, setSelectedIdx] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Ctrl+K / Cmd+K to focus
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (mode === 'compact') setCompactOpen(true);
                setTimeout(() => inputRef.current?.focus(), 50);
            }
            if (e.key === 'Escape') {
                setOpen(false);
                setCompactOpen(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [mode]);

    // Click outside closes dropdown/compact
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                if (mode === 'compact') setCompactOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [mode]);

    // Check if we should hide search on this path (AFTER all hooks)
    const isHidden = HIDDEN_PATHS.some(p => location.pathname.startsWith(p));
    if (isHidden) return null;

    const doSearch = useCallback((q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        api.get(`/search?q=${encodeURIComponent(q.trim())}`)
            .then(res => {
                setResults(res.data || []);
                setOpen(true);
                setSelectedIdx(-1);
            })
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(val), 280);
    };

    const handleSelect = (result: SearchResult) => {
        setQuery('');
        setResults([]);
        setOpen(false);
        setCompactOpen(false);
        navigate(result.path);
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (!open || results.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, -1)); }
        if (e.key === 'Enter' && selectedIdx >= 0) { e.preventDefault(); handleSelect(results[selectedIdx]); }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setOpen(false);
        inputRef.current?.focus();
    };

    const categories = results.filter(r => r.type === 'category');
    const products = results.filter(r => r.type === 'product');

    // ──────────────────────────────────────────────
    // EXPANDED MODE — shown on home page hero section
    // ──────────────────────────────────────────────
    if (mode === 'expanded') {
        return (
            <div ref={containerRef} className="relative w-full max-w-xl mr-auto z-[50]">
                <div
                    className={`relative flex items-center gap-3 backdrop-blur-2xl rounded-2xl border-2 transition-all duration-300 overflow-hidden ${open ? 'border-primary' : isDark ? 'border-primary/30' : 'border-primary/15'}`}
                    style={{
                        backgroundColor: isDark ? 'rgba(30, 18, 8, 0.92)' : 'rgba(255, 253, 248, 0.92)',
                        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(194, 65, 12, 0.08)'
                    }}
                >
                    {/* Glass shine sweep */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                        <div className="absolute inset-0 -translate-x-full animate-[searchShine_3s_ease-in-out_infinite]" style={{ background: isDark ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' : 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)' }} />
                    </div>
                    <Search className="ml-5 h-5 w-5 text-primary flex-shrink-0 relative z-[1]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onKeyDown={handleKey}
                        onFocus={() => query.length >= 2 && setOpen(true)}
                        placeholder="Search premixes, products... (Ctrl+K)"
                        data-search-hero="true"
                        autoComplete="off"
                        className="flex-1 py-4 pr-4 outline-none text-sm font-medium relative z-[1]"
                        style={{
                            backgroundColor: 'transparent',
                            color: isDark ? '#F0DEC8' : '#5D4037',
                            caretColor: isDark ? '#F0DEC8' : '#5D4037'
                        }}
                    />
                    {loading && <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary/50 relative z-[1]" />}
                    {query && !loading && (
                        <button onClick={clearSearch} className="mr-4 text-gray-400 hover:text-gray-600 transition-colors relative z-[1]">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <SearchDropdown
                    open={open}
                    categories={categories}
                    products={products}
                    selectedIdx={selectedIdx}
                    results={results}
                    onSelect={handleSelect}
                    query={query}
                    isDark={isDark}
                />
            </div>
        );
    }

    // ──────────────────────────────────────────────
    // COMPACT MODE — in Navbar as globe/search icon
    // ──────────────────────────────────────────────
    return (
        <div ref={containerRef} className="relative">
            <AnimatePresence mode="wait">
                {compactOpen ? (
                    <motion.div
                        key="expanded"
                        initial={{ width: 40, opacity: 0 }}
                        animate={{ width: 220, opacity: 1 }}
                        exit={{ width: 40, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className={`flex items-center gap-2 bg-white rounded-2xl shadow-lg border-2 transition-colors ${open ? 'border-primary' : 'border-gray-200'}`}
                    >
                        <Search className="ml-3 h-4 w-4 text-primary flex-shrink-0" />
                        <input
                            ref={inputRef}
                            autoFocus
                            type="text"
                            value={query}
                            onChange={handleChange}
                            onKeyDown={handleKey}
                            placeholder="Search..."
                            className="flex-1 py-2.5 pr-3 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                        />
                        {loading && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin text-primary/50" />}
                        {query && (
                            <button onClick={clearSearch} className="mr-2 text-gray-400 hover:text-gray-600">
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.button
                        key="icon"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => { setCompactOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
                        className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-2xl transition-all duration-300 shadow-sm"
                        title="Search (Ctrl+K)"
                    >
                        <Search className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>
            <SearchDropdown
                open={open}
                categories={categories}
                products={products}
                selectedIdx={selectedIdx}
                results={results}
                onSelect={handleSelect}
                query={query}
                compact
                isDark={isDark}
            />
        </div>
    );
};

// ───── Shared dropdown ─────────────────────────────
interface DropdownProps {
    open: boolean;
    categories: SearchResult[];
    products: SearchResult[];
    results: SearchResult[];
    selectedIdx: number;
    onSelect: (r: SearchResult) => void;
    query: string;
    compact?: boolean;
    isDark: boolean;
}

const SearchDropdown: React.FC<DropdownProps> = ({ open, categories, products, results, selectedIdx, onSelect, query, compact, isDark }) => (
    <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`absolute ${compact ? 'right-0' : 'left-0 right-0'} top-full mt-2 rounded-2xl z-[200] overflow-hidden`}
                style={{
                    minWidth: compact ? 320 : undefined,
                    backgroundColor: isDark ? '#271608' : '#FFF9F0',
                    border: isDark ? '1px solid rgba(194, 65, 12, 0.2)' : '1px solid rgba(194, 65, 12, 0.1)',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(194, 65, 12, 0.12)'
                }}
            >
                {results.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <span className="text-3xl mb-3 block">🔍</span>
                        <p className="text-sm font-bold" style={{ color: isDark ? '#CEB48E' : '#6B3A1F' }}>No results for "{query}"</p>
                        <p className="text-xs mt-1" style={{ color: isDark ? '#7D5F45' : '#A08060' }}>Try a different keyword or browse categories</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto">
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div>
                                <p className="px-4 py-2 text-[9px] font-black uppercase tracking-widest" style={{ color: isDark ? '#7D5F45' : '#A08060' }}>
                                    <LayoutGrid className="inline h-3 w-3 mr-1" />Categories
                                </p>
                                {categories.map((r, i) => (
                                    <ResultRow key={`cat-${r.id}`} r={r} idx={i} selectedIdx={selectedIdx} onSelect={onSelect} isDark={isDark} />
                                ))}
                            </div>
                        )}
                        {/* Products */}
                        {products.length > 0 && (
                            <div>
                                <p className="px-4 py-2 text-[9px] font-black uppercase tracking-widest" style={{ color: isDark ? '#7D5F45' : '#A08060' }}>
                                    <Package2 className="inline h-3 w-3 mr-1" />Products
                                </p>
                                {products.map((r, i) => (
                                    <ResultRow key={`prod-${r.id}`} r={r} idx={categories.length + i} selectedIdx={selectedIdx} onSelect={onSelect} isDark={isDark} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="px-4 py-2 flex justify-between items-center" style={{ backgroundColor: isDark ? 'rgba(26, 15, 7, 0.6)' : 'rgba(255, 240, 214, 0.6)' }}>
                    <span className="text-[9px] font-medium" style={{ color: isDark ? '#7D5F45' : '#A08060' }}>↑↓ navigate · Enter to open</span>
                    <span className="text-[9px] font-medium" style={{ color: isDark ? '#7D5F45' : '#A08060' }}>Esc to close</span>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ResultRow: React.FC<{ r: SearchResult; idx: number; selectedIdx: number; onSelect: (r: SearchResult) => void; isDark: boolean }> = ({ r, idx, selectedIdx, onSelect, isDark }) => (
    <button
        onClick={() => onSelect(r)}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150"
        style={{
            backgroundColor: idx === selectedIdx
                ? (isDark ? 'rgba(194, 65, 12, 0.12)' : 'rgba(194, 65, 12, 0.06)')
                : 'transparent'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? 'rgba(194, 65, 12, 0.1)' : 'rgba(194, 65, 12, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx === selectedIdx ? (isDark ? 'rgba(194, 65, 12, 0.12)' : 'rgba(194, 65, 12, 0.06)') : 'transparent'}
    >
        {r.imageUrl ? (
            <img src={r.imageUrl} alt={r.name} className="h-10 w-10 rounded-xl object-cover flex-shrink-0" style={{ border: isDark ? '2px solid rgba(194, 65, 12, 0.15)' : '2px solid rgba(194, 65, 12, 0.08)' }} />
        ) : (
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.type === 'category' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                {r.type === 'category' ? <LayoutGrid className="h-4 w-4" /> : <Package2 className="h-4 w-4" />}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate" style={{ color: isDark ? '#F0DEC8' : '#3E2723' }}>{r.name}</p>
            {r.type === 'product' && r.price && (
                <p className="text-xs font-black text-primary">₹{r.price.toLocaleString('en-IN')}</p>
            )}
            {r.type === 'category' && r.description && (
                <p className="text-xs truncate" style={{ color: isDark ? '#7D5F45' : '#A08060' }}>{r.description}</p>
            )}
        </div>
        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isDark ? '#4A2D14' : '#D2B48C' }} />
    </button>
);

export default SearchBar;
