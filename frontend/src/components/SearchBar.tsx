import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, ArrowRight, Package2, LayoutGrid, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

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
            <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
                <div className={`flex items-center gap-3 bg-white rounded-2xl shadow-xl shadow-primary/10 border-2 transition-all duration-300 ${open ? 'border-primary' : 'border-transparent'}`}>
                    <Search className="ml-5 h-5 w-5 text-primary flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleChange}
                        onKeyDown={handleKey}
                        onFocus={() => query.length >= 2 && setOpen(true)}
                        placeholder="Search masalas, premixes, snacks... (Ctrl+K)"
                        className="flex-1 py-4 pr-4 text-gray-900 placeholder:text-gray-400 bg-transparent outline-none text-sm font-medium"
                    />
                    {loading && <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary/50" />}
                    {query && !loading && (
                        <button onClick={clearSearch} className="mr-4 text-gray-400 hover:text-gray-600 transition-colors">
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
}

const SearchDropdown: React.FC<DropdownProps> = ({ open, categories, products, results, selectedIdx, onSelect, query, compact }) => (
    <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`absolute ${compact ? 'right-0' : 'left-0 right-0'} top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden`}
                style={{ minWidth: compact ? 320 : undefined }}
            >
                {results.length === 0 ? (
                    <div className="px-5 py-8 text-center">
                        <span className="text-3xl mb-3 block">🔍</span>
                        <p className="text-sm font-bold text-gray-500">No results for "{query}"</p>
                        <p className="text-xs text-gray-400 mt-1">Try a different keyword or browse categories</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {/* Categories */}
                        {categories.length > 0 && (
                            <div>
                                <p className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <LayoutGrid className="inline h-3 w-3 mr-1" />Categories
                                </p>
                                {categories.map((r, i) => (
                                    <ResultRow key={`cat-${r.id}`} r={r} idx={i} selectedIdx={selectedIdx} onSelect={onSelect} results={results} />
                                ))}
                            </div>
                        )}
                        {/* Products */}
                        {products.length > 0 && (
                            <div>
                                <p className="px-4 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <Package2 className="inline h-3 w-3 mr-1" />Products
                                </p>
                                {products.map((r, i) => (
                                    <ResultRow key={`prod-${r.id}`} r={r} idx={categories.length + i} selectedIdx={selectedIdx} onSelect={onSelect} results={results} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
                <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                    <span className="text-[9px] text-gray-400 font-medium">↑↓ navigate · Enter to open</span>
                    <span className="text-[9px] text-gray-400 font-medium">Esc to close</span>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

const ResultRow: React.FC<{ r: SearchResult; idx: number; selectedIdx: number; onSelect: (r: SearchResult) => void; results: SearchResult[] }> = ({ r, idx, selectedIdx, onSelect }) => (
    <button
        onClick={() => onSelect(r)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === selectedIdx ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
    >
        {r.imageUrl ? (
            <img src={r.imageUrl} alt={r.name} className="h-10 w-10 rounded-xl object-cover flex-shrink-0 bg-gray-100" />
        ) : (
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.type === 'category' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                {r.type === 'category' ? <LayoutGrid className="h-4 w-4" /> : <Package2 className="h-4 w-4" />}
            </div>
        )}
        <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{r.name}</p>
            {r.type === 'product' && r.price && (
                <p className="text-xs text-primary font-black">₹{r.price.toLocaleString('en-IN')}</p>
            )}
            {r.type === 'category' && r.description && (
                <p className="text-xs text-gray-400 truncate">{r.description}</p>
            )}
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
    </button>
);

export default SearchBar;
