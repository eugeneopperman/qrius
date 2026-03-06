// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://support.qriuscodes.com',
	integrations: [
		starlight({
			title: 'Qrius Codes Support',
			logo: {
				src: './public/icon.svg',
				alt: 'Qrius Codes',
			},
			customCss: ['./src/styles/custom.css'],
			components: {
				Footer: './src/components/Footer.astro',
			},
			head: [
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
				{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
				{ tag: 'link', attrs: { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' } },
			],
			social: [
				{ icon: 'external', label: 'Qrius Codes', href: 'https://qriuscodes.com' },
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Welcome', slug: 'index' },
						{ label: 'Create an Account', slug: 'getting-started/create-account' },
						{ label: 'Create Your First QR Code', slug: 'getting-started/create-first-qr' },
						{ label: 'Dashboard Overview', slug: 'getting-started/dashboard-overview' },
						{ label: 'Download Formats', slug: 'getting-started/download-formats' },
					],
				},
				{
					label: 'QR Code Types',
					autogenerate: { directory: 'qr-types' },
				},
				{
					label: 'Customization',
					autogenerate: { directory: 'customization' },
				},
				{
					label: 'Analytics',
					autogenerate: { directory: 'analytics' },
				},
				{
					label: 'Account & Settings',
					autogenerate: { directory: 'account' },
				},
				{
					label: 'Billing & Plans',
					autogenerate: { directory: 'billing' },
				},
				{
					label: 'Troubleshooting',
					autogenerate: { directory: 'troubleshooting' },
				},
			],
		}),
	],
});
