-- Categories
INSERT INTO public.categories (id, name) VALUES
('11111111-1111-1111-1111-111111111111', 'Technology'),
('22222222-2222-2222-2222-222222222222', 'Lifestyle'),
('33333333-3333-3333-3333-333333333333', 'Travel')
ON CONFLICT (id) DO NOTHING;

-- Custom Users
-- Admin User
INSERT INTO public.users (id, email, password, name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@user.com', 'adminuser', 'Admin User', 'admin');

-- Mock User
INSERT INTO public.users (id, email, password, name, role) VALUES
('00000000-0000-0000-0000-000000000002', 'mock@user.com', 'mockuser', 'Mock User', 'user');

-- Posts
INSERT INTO public.posts (id, title, content, thumbnail_url, published, category_id, author_id, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'めっちゃ長いサンプルテキスト現る！一ーその長さ、もはや「読ませる気ゼロ」の域へ', '今日末明、インターネット上に突如として出現した「めっちゃ長いサンプルテキスト」が、デザイナ一界隈やエンジニア界隈を中心に静かな衝撃を与えている。問題のテキストは、「とりあえずそれっぽく埋めたいだけなんだよね」という軽い気持ちから書き始められたとされるが、気づけば見出し・本文・脚注・おまけコラム・作者の反省会までを内包するサンプルの皮をかぶった本編のような構成になっていた。', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', true, '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
