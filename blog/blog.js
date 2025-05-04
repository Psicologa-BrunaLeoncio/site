document.addEventListener('DOMContentLoaded', () => {
    // Supabase client setup
    const supabaseUrl = 'https://hlkawnhbsyytixmkmllu.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsa2F3bmhic3l5dGl4bWttbGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDc4MjYsImV4cCI6MjA2MTg4MzgyNn0.QtzQD9usxiIz-acAKHDkP56SWFmyk3K8MqzXHXTm_A0';
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    let blogState = {
        posts: [],
        categories: [],
        selectedCategory: null,
        loading: true
    };

    const blogGrid = document.querySelector('.blog-grid');
    const categoryFilter = document.querySelector('.filter-select');
    const searchBox = document.querySelector('.search-box');
    const sortSelect = document.querySelector('.sort-select');

    // Blog detail elements
    const blogDetail = document.querySelector('.blog-detail');
    const blogDetailImage = document.querySelector('.blog-detail-image');
    const blogDetailCategory = document.querySelector('.blog-detail .blog-category');
    const blogDetailTitle = document.querySelector('.blog-detail .blog-title');
    const blogDetailMeta = document.querySelector('.blog-detail .blog-meta');
    const blogDetailDate = document.querySelector('.blog-detail .blog-date');
    const blogDetailContent = document.querySelector('.blog-detail .blog-content-full');
    const blogDetailShare = document.querySelector('.blog-detail .share-buttons');
    const closeBtn = document.querySelector('.close-btn');

    // Used for opening post overlay
    function openBlogDetail(post) {
        // Populate visible fields
        if (post.imagem_capa) {
            blogDetailImage.src = post.imagem_capa;
            blogDetailImage.style.display = 'block';
        } else {
            blogDetailImage.style.display = 'none';
        }

        if (post.categoria_nome) {
            blogDetailCategory.textContent = post.categoria_nome;
            blogDetailCategory.style.display = 'inline-block';
        } else {
            blogDetailCategory.style.display = 'none';
        }
        if (post.titulo) {
            blogDetailTitle.textContent = post.titulo;
        }
        if (post.publicado_em) {
            blogDetailMeta.style.display = 'flex';
            blogDetailDate.textContent = new Date(post.publicado_em).toLocaleDateString('pt-BR');
        } else {
            blogDetailMeta.style.display = 'none';
        }
        // Render HTML (conteudo)
        blogDetailContent.innerHTML = post.conteudo || '';
        blogDetailShare.style.display = 'flex';
        blogDetail.classList.add('active');
        closeBtn.style.opacity = '1';
        closeBtn.style.pointerEvents = 'all';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            blogDetail.scrollTo(0, 0);
        }, 50);

        // Attach/re-attach share button events
        const shareBtns = blogDetail.querySelectorAll('.share-btn');
        shareBtns.forEach(btn => {
            btn.onclick = () => {
                const platform = btn.dataset.platform;
                const postUrl = `${window.location.origin}/blog/${post.slug}?id=${post.id}`;
                const title = post.titulo;
                switch (platform) {
                    case 'whatsapp':
                        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + postUrl)}`);
                        break;
                    case 'facebook':
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`);
                        break;
                    case 'twitter':
                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`);
                        break;
                    case 'copy':
                        navigator.clipboard.writeText(postUrl).then(() => showNotification('Link copiado para a área de transferência!'));
                        break;
                }
            };
        });
    }

    // Close overlay handler
    function closeDetail() {
        blogDetail.classList.remove('active');
        closeBtn.style.opacity = '0';
        closeBtn.style.pointerEvents = 'none';
        document.body.style.overflow = 'auto';
        // Remove slug/id params from URL on close (back to listing)
        const url = new URL(window.location);
        if (url.pathname.startsWith("/blog/")) {
            window.history.pushState({}, '', "/blog");
        }
    }
    if (closeBtn) {
        closeBtn.onclick = closeDetail;
    }

    // Detect overlay open on direct URL
    async function openDetailFromURL() {
        const url = new URL(window.location);
        const matches = url.pathname.match(/^\/blog\/([^/?#]+)/);
        const slug = matches ? matches[1] : null;
        const id = url.searchParams.get('id');
        if (slug) {
            // Try to fetch the post using the slug
            const { data, error } = await supabase
                .from('v_posts_blog_com_categorias')
                .select('*')
                .eq('slug', slug)
                .limit(1);

            const post = data && data[0];
            if (post) {
                openBlogDetail(post);
            } else {
                // Unknown post, fallback
                showNotification("Post não encontrado ou removido.");
            }
        }
    }

    // Listing logic
    initBlog();

    async function initBlog() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('categoria');
        await loadCategories();
        await loadPosts(categoryParam);

        // If in detail view (/blog/slug)
        if (/^\/blog\/[^/?#]+/.test(window.location.pathname)) {
            await openDetailFromURL();
        }
        setupEventListeners();
    }

    async function loadCategories() {
        const { data, error } = await supabase.from('categorias').select('*');
        if (error) return console.error(error);
        blogState.categories = data;
        populateCategoryFilter(data);
    }

    async function loadPosts(categorySlug = null) {
        blogState.loading = true;
        updateUI();
        let query = supabase
            .from('v_posts_blog_com_categorias')
            .select('*')
            .eq('status', 'publicado');
        if (categorySlug) {
            query = query.eq('categoria_slug', categorySlug);
            blogState.selectedCategory = categorySlug;
            if (categoryFilter) categoryFilter.value = categorySlug;
        }
        query = query.order('publicado_em', { ascending: false });
        const { data, error } = await query;
        if (error) return console.error(error);
        blogState.posts = data;
        blogState.loading = false;
        updateUI();
    }

    function populateCategoryFilter(categories) {
        if (!categoryFilter) return;

        while (categoryFilter.options.length > 1) {
            categoryFilter.remove(1);
        }
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.slug;
            opt.textContent = cat.nome;
            categoryFilter.appendChild(opt);
        });
        const selected = new URLSearchParams(window.location.search).get('categoria');
        if (selected) categoryFilter.value = selected;
    }

    function updateUI() {
        if (!blogGrid) return;
        blogGrid.innerHTML = '';
        if (blogState.loading) {
            blogGrid.innerHTML = `<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i><p>Carregando posts...</p></div>`;
            return;
        }
        if (blogState.posts.length === 0) {
            blogGrid.innerHTML = `<div class="no-results"><h3>Nenhum post encontrado.</h3></div>`;
            return;
        }
        blogState.posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.dataset.id = post.id;
            card.dataset.slug = post.slug;
            const dataPub = new Date(post.publicado_em).toLocaleDateString('pt-BR');
            card.innerHTML = `
                <img src="${post.imagem_capa || 'assets/default-blog-image.jpg'}" alt="${post.titulo}" class="blog-image">
                <div class="blog-content">
                    <span class="blog-category">${post.categoria_nome}</span>
                    <h3>${post.titulo}</h3>
                    <p class="blog-excerpt">${post.resumo || (post.conteudo ? post.conteudo.slice(0, 120) + '...' : '')}</p>
                    <div class="blog-meta">
                        <span class="blog-date">${dataPub}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.pushState({}, '', `/blog/${post.slug}?id=${post.id}`);
                openBlogDetail(post);
            });
            blogGrid.appendChild(card);
        });
    }

    function setupEventListeners() {
        // Categoria
        if (categoryFilter) {
            categoryFilter.addEventListener('change', e => {
                const slug = e.target.value;
                if (slug) {
                    loadPosts(slug);
                    const url = new URL(window.location);
                    url.searchParams.set('categoria', slug);
                    window.history.pushState({}, '', url);
                } else {
                    loadPosts();
                    const url = new URL(window.location);
                    url.searchParams.delete('categoria');
                    window.history.pushState({}, '', url);
                }
            });
        }
        // Busca
        if (searchBox) {
            searchBox.addEventListener('input', e => {
                const search = e.target.value.toLowerCase();
                const filtered = blogState.posts.filter(post =>
                    post.titulo.toLowerCase().includes(search) ||
                    (post.conteudo && post.conteudo.toLowerCase().includes(search)) ||
                    (post.categoria_nome && post.categoria_nome.toLowerCase().includes(search))
                );
                renderFilteredPosts(filtered);
            });
        }
        // Ordenação
        if (sortSelect) {
            sortSelect.addEventListener('change', e => {
                const opt = e.target.value;
                const posts = [...blogState.posts];
                if (opt === 'title') posts.sort((a, b) => a.titulo.localeCompare(b.titulo));
                if (opt === 'recent') posts.sort((a, b) => new Date(b.publicado_em) - new Date(a.publicado_em));
                if (opt === 'old') posts.sort((a, b) => new Date(a.publicado_em) - new Date(b.publicado_em));
                blogState.posts = posts;
                updateUI();
            });
        }
        // SPA navigation for slug
        window.addEventListener('popstate', async () => {
            if (/^\/blog\/[^/?#]+/.test(window.location.pathname)) {
                await openDetailFromURL();
            } else {
                closeDetail();
                // Also update listing on pop if category search param changed
                const categoria = new URLSearchParams(window.location.search).get('categoria');
                loadPosts(categoria);
            }
        });
        // Click outside blog overlay closes it (optionally, not required)
        blogDetail.addEventListener('click', e => {
            if (e.target === blogDetail) closeDetail();
        });
    }

    function renderFilteredPosts(posts) {
        blogGrid.innerHTML = '';
        if (posts.length === 0) {
            blogGrid.innerHTML = `<div class="no-results"><h3>Nenhum post encontrado para sua busca.</h3></div>`;
            return;
        }
        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.innerHTML = `
                <img src="${post.imagem_capa || 'assets/default-blog-image.jpg'}" alt="${post.titulo}" class="blog-image">
                <div class="blog-content">
                    <span class="blog-category">${post.categoria_nome}</span>
                    <h3>${post.titulo}</h3>
                    <p class="blog-excerpt">${post.resumo || (post.conteudo ? post.conteudo.slice(0, 120) + '...' : '')}</p>
                    <div class="blog-meta">
                        <span class="blog-date">${new Date(post.publicado_em).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.pushState({}, '', `/blog/${post.slug}?id=${post.id}`);
                openBlogDetail(post);
            });
            blogGrid.appendChild(card);
        });
    }

    // Small notifications
    function showNotification(message, duration = 3000) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.custom-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'custom-notification';
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
        // Auto-hide after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
});
