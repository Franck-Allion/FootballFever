<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;900&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
    body {
      background-color: #050505;
      color: #e3e2e2;
      font-family: 'Inter', sans-serif;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .glass-card {
      background: rgba(18, 18, 18, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .neon-glow-primary {
      box-shadow: 0 0 20px rgba(57, 255, 20, 0.4);
    }
    .neon-border-primary {
      border: 1px solid #39FF14;
    }
    .segmented-bar-block {
      height: 8px;
      flex: 1;
      margin-right: 2px;
    }
    .segmented-bar-block:last-child {
      margin-right: 0;
    }
  </style>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
                  "secondary-fixed-dim": "#c8c6c5",
                  "on-tertiary": "#313030",
                  "on-secondary-container": "#bab8b7",
                  "on-primary": "#053900",
                  "on-primary-fixed": "#022100",
                  "on-error-container": "#ffdad6",
                  "primary-fixed": "#79ff5b",
                  "surface-container-high": "#292a2a",
                  "background": "#121414",
                  "tertiary": "#fdf9f9",
                  "inverse-on-surface": "#303031",
                  "on-primary-fixed-variant": "#095300",
                  "error": "#ffb4ab",
                  "surface-container-low": "#1b1c1c",
                  "surface-tint": "#2ae500",
                  "on-tertiary-fixed": "#1c1b1b",
                  "outline": "#85967c",
                  "on-primary-container": "#107100",
                  "error-container": "#93000a",
                  "on-surface": "#e3e2e2",
                  "secondary": "#c8c6c5",
                  "inverse-surface": "#e3e2e2",
                  "tertiary-fixed": "#e5e2e1",
                  "on-surface-variant": "#baccb0",
                  "on-secondary-fixed-variant": "#474646",
                  "on-background": "#e3e2e2",
                  "on-secondary": "#313030",
                  "surface-dim": "#121414",
                  "secondary-fixed": "#e5e2e1",
                  "on-tertiary-fixed-variant": "#474646",
                  "surface": "#121414",
                  "surface-bright": "#383939",
                  "on-tertiary-container": "#626161",
                  "tertiary-fixed-dim": "#c9c6c5",
                  "on-secondary-fixed": "#1c1b1b",
                  "primary": "#efffe3",
                  "surface-container": "#1f2020",
                  "primary-container": "#39ff14",
                  "outline-variant": "#3c4b35",
                  "surface-container-lowest": "#0d0e0f",
                  "tertiary-container": "#e0dddc",
                  "on-error": "#690005",
                  "primary-fixed-dim": "#2ae500",
                  "surface-variant": "#343535",
                  "inverse-primary": "#106e00",
                  "surface-container-highest": "#343535",
                  "secondary-container": "#4a4949"
          },
          "borderRadius": {
                  "DEFAULT": "0.125rem",
                  "lg": "0.25rem",
                  "xl": "0.5rem",
                  "full": "0.75rem"
          },
          "spacing": {
                  "gutter": "16px",
                  "base": "4px",
                  "container-margin": "20px",
                  "md": "24px",
                  "lg": "40px",
                  "xs": "8px",
                  "sm": "16px",
                  "xl": "64px"
          },
          "fontFamily": {
                  "h2": ["Space Grotesk"],
                  "label-caps": ["Space Grotesk"],
                  "h1": ["Space Grotesk"],
                  "body-lg": ["Inter"],
                  "stat-value": ["Space Grotesk"],
                  "body-md": ["Inter"]
          },
          "fontSize": {
                  "h2": ["24px", {"lineHeight": "1.2", "letterSpacing": "0.02em", "fontWeight": "600"}],
                  "label-caps": ["12px", {"lineHeight": "1", "letterSpacing": "0.1em", "fontWeight": "600"}],
                  "h1": ["40px", {"lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                  "body-lg": ["18px", {"lineHeight": "1.6", "fontWeight": "400"}],
                  "stat-value": ["20px", {"lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "700"}],
                  "body-md": ["16px", {"lineHeight": "1.5", "fontWeight": "400"}]
          }
        },
      },
    }
  </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface-container-lowest text-on-surface min-h-screen pb-24">
<!-- TOP APP BAR -->
<header class="fixed top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-[#121212]/40 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
<div class="flex items-center gap-3">
<div class="w-10 h-10 bg-primary-container rounded-sm flex items-center justify-center overflow-hidden">
<img alt="Team Logo" class="w-full h-full object-cover" data-alt="A futuristic, high-contrast sports team logo featuring a minimalist stylized hawk head. The logo is rendered in vibrant neon green against a matte black circular background with a subtle digital glitch effect. The style is aggressive and tech-forward, matching a cyberpunk tactical aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-eGwwkgFKob35tdkrrHADIjjNfz__rknjcNfSY5YutuNuNCr5AXlB8ehLtCGn7UVCKTSyeHv236wxh-DgN8sHzKEcp9CdIcZot6fWULjHK4wWx-jw0TGHXIR4JRRQl33e3hW8ZapXEjcqDsJ-1gRKSOWbQlZzBaBQgnhz9WMdoO47rOf-xRTZPwffTzDt7yHCiiew5aemwrZBDvNEzMwLkF9HgL011XTLniLP3XL7kM-sqWxEYAkdVQxJfwNFLsnBErmhm0N3zW8"/>
</div>
<div>
<h1 class="text-xl font-black text-[#39FF14] drop-shadow-[0_0_8px_rgba(57,255,20,0.5)] font-['Space_Grotesk'] uppercase tracking-widest">STRIKER_COMMAND</h1>
<div class="flex gap-2 items-center">
<span class="font-label-caps text-[10px] text-white/50 tracking-widest">DIV_04</span>
<span class="w-1 h-1 bg-primary-container rounded-full"></span>
<span class="font-label-caps text-[10px] text-[#39FF14] tracking-widest">💎 1,500</span>
</div>
</div>
</div>
<div class="flex items-center gap-4">
<button class="material-symbols-outlined text-white/60 hover:text-[#39FF14] transition-all duration-300 ease-in-out active:scale-95" data-icon="notifications">notifications</button>
<button class="material-symbols-outlined text-white/60 hover:text-[#39FF14] transition-all duration-300 ease-in-out active:scale-95" data-icon="settings">settings</button>
</div>
</header>
<!-- NAVIGATION DRAWER (DESKTOP) -->
<aside class="hidden lg:flex flex-col h-full fixed left-0 top-0 pt-20 w-64 bg-[#050505] border-r border-white/10 z-40">
<div class="px-6 py-4 flex items-center gap-3 mb-8">
<div class="w-12 h-12 rounded-full border border-primary-container p-0.5">
<img alt="Manager Avatar" class="w-full h-full rounded-full object-cover" data-alt="A portrait of a futuristic football manager, wearing a sleek black high-collar technical jacket with glowing green neural link ports on the neck. The character has a stern, tactical expression, illuminated by the cool green glow of nearby holographic displays. The art style is high-contrast digital painting with cinematic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2bHgFQtxn0sELssebtOLa6HXTAHz6-p1FMGYQGlukJrgZnZ5P1OKVyRmiGTF5U1kvl28tUhCne4N9gf_GAg5HrxMv1kyzDj7CAept8lBEidIMHlDDuEUcvoPb9UqvQJSzQo2lSfF5L7ML2RwZCm2kzynIwfAQylNT8sHAlBfnedNDGLd3MrBCuqL0pTOE1rT8rSZn7qSX6PWTG6H4X9v-XdoYq54sYC3FHyzZyIcY57_mnOVL3RK-pj0qTxgj7iGA-ldzgFeUYLE"/>
</div>
<div>
<p class="font-label-caps text-white font-bold tracking-tighter">COMMANDER_01</p>
<p class="text-[10px] text-white/40 uppercase">Prestige: 4.8k</p>
</div>
</div>
<nav class="flex-1 px-4 space-y-2">
<a class="flex items-center gap-3 px-4 py-3 text-[#39FF14] bg-[#39FF14]/10 border-l-4 border-[#39FF14] font-['Space_Grotesk'] transition-all" href="#">
<span class="material-symbols-outlined" data-icon="grid_view">grid_view</span>
<span class="text-sm font-bold tracking-wider">DASHBOARD</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-[#121212] font-['Space_Grotesk'] transition-all" href="#">
<span class="material-symbols-outlined" data-icon="strategy">strategy</span>
<span class="text-sm font-bold tracking-wider uppercase">Tactics</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-[#121212] font-['Space_Grotesk'] transition-all" href="#">
<span class="material-symbols-outlined" data-icon="history">history</span>
<span class="text-sm font-bold tracking-wider uppercase">History</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-[#121212] font-['Space_Grotesk'] transition-all" href="#">
<span class="material-symbols-outlined" data-icon="leaderboard">leaderboard</span>
<span class="text-sm font-bold tracking-wider uppercase">Leaderboard</span>
</a>
</nav>
</aside>
<!-- MAIN CONTENT CANVAS -->
<main class="pt-24 px-container-margin lg:ml-64 max-w-6xl mx-auto space-y-6">
<!-- DATA HUD: CORE TEAM VITALS -->
<section class="glass-card rounded-lg p-4 flex justify-around items-center border-white/5 relative overflow-hidden">
<div class="absolute inset-0 bg-gradient-to-r from-transparent via-[#39FF14]/5 to-transparent pointer-events-none"></div>
<div class="text-center">
<p class="font-label-caps text-[10px] text-white/40 mb-1">TEAM MORALE</p>
<p class="font-stat-value text-[#39FF14] animate-pulse">EXCESSIVE</p>
</div>
<div class="w-[1px] h-8 bg-white/10"></div>
<div class="text-center">
<p class="font-label-caps text-[10px] text-white/40 mb-1">SQUAD DEPTH</p>
<p class="font-stat-value text-white">CRITICAL (14)</p>
</div>
<div class="w-[1px] h-8 bg-white/10"></div>
<div class="text-center">
<p class="font-label-caps text-[10px] text-white/40 mb-1">STREAK</p>
<p class="font-stat-value text-[#39FF14]">W-W-W-L-W</p>
</div>
</section>
<!-- BENTO GRID LAYOUT -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<!-- TEAM OVERVIEW CARD -->
<section class="md:col-span-2 glass-card rounded-xl p-6 relative overflow-hidden group">
<div class="absolute top-0 right-0 p-4">
<span class="text-6xl font-black text-white/5 font-['Space_Grotesk'] absolute top-2 right-4 pointer-events-none uppercase">Squad</span>
</div>
<div class="flex items-start justify-between mb-8">
<div>
<h2 class="font-h2 text-white uppercase tracking-tighter mb-1">Team Overview</h2>
<p class="text-xs text-white/40 font-['Space_Grotesk']">PRIMARY SQUADRON_ALPHA</p>
</div>
<div class="text-right">
<span class="text-sm font-label-caps text-[#39FF14] bg-[#39FF14]/10 px-3 py-1 rounded-sm border border-[#39FF14]/30">84 OVR</span>
</div>
</div>
<div class="grid grid-cols-2 gap-8 mb-8">
<div class="space-y-4">
<div>
<p class="font-label-caps text-[10px] text-white/60 mb-2 uppercase tracking-widest">Tactical Formation</p>
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#39FF14]" data-icon="widgets">widgets</span>
<p class="font-h2 text-white">4-4-2 <span class="text-sm text-white/40 font-normal">DIAMOND</span></p>
</div>
</div>
</div>
<div class="space-y-4">
<div>
<p class="font-label-caps text-[10px] text-white/60 mb-2 uppercase tracking-widest">Squad Health</p>
<div class="flex gap-0.5">
<!-- RPG Stat Indicator: Segmented Bar -->
<div class="segmented-bar-block bg-[#39FF14] neon-glow-primary shadow-[0_0_8px_#39FF14]"></div>
<div class="segmented-bar-block bg-[#39FF14] neon-glow-primary shadow-[0_0_8px_#39FF14]"></div>
<div class="segmented-bar-block bg-[#39FF14] neon-glow-primary shadow-[0_0_8px_#39FF14]"></div>
<div class="segmented-bar-block bg-[#39FF14] neon-glow-primary shadow-[0_0_8px_#39FF14]"></div>
<div class="segmented-bar-block bg-[#39FF14] neon-glow-primary shadow-[0_0_8px_#39FF14]"></div>
<div class="segmented-bar-block bg-[#39FF14] neon-glow-primary shadow-[0_0_8px_#39FF14]"></div>
<div class="segmented-bar-block bg-white/10"></div>
<div class="segmented-bar-block bg-white/10"></div>
<div class="segmented-bar-block bg-white/10"></div>
<div class="segmented-bar-block bg-white/10"></div>
</div>
<p class="text-[10px] text-[#39FF14] mt-1 font-bold">60% STAMINA AVG</p>
</div>
</div>
</div>
<div class="flex gap-2">
<span class="px-3 py-1 bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-bold rounded-full border border-[#39FF14]/20 tracking-wider">ELITE_ATTACK</span>
<span class="px-3 py-1 bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-bold rounded-full border border-[#39FF14]/20 tracking-wider">PRESSING_HEAVY</span>
</div>
</section>
<!-- NEXT OPPONENT CARD -->
<section class="glass-card rounded-xl p-6 flex flex-col justify-between border-white/5 bg-gradient-to-br from-[#121212]/80 to-transparent">
<div>
<p class="font-label-caps text-[10px] text-white/40 mb-4 uppercase tracking-widest">Up Next</p>
<div class="flex flex-col items-center py-4">
<div class="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
<span class="material-symbols-outlined text-4xl text-white/20" data-icon="security">security</span>
</div>
<h3 class="font-h2 text-white uppercase tracking-tighter">VOID_TITANS</h3>
<p class="text-[#39FF14]/60 text-xs font-['Space_Grotesk'] mt-1">GALAXY_STADIUM_B</p>
</div>
</div>
<div class="pt-4 border-t border-white/5">
<div class="flex justify-between items-center">
<span class="text-xs text-white/60">DIFFICULTY</span>
<span class="text-xs font-bold text-error uppercase px-2 py-1 bg-error/10 border border-error/20 rounded-sm">Lvl. 12 - HARD</span>
</div>
</div>
</section>
<!-- PRIMARY ACTION: PLAY MATCH -->
<section class="md:col-span-2">
<button class="w-full h-24 bg-[#39FF14] rounded-xl flex items-center justify-between px-8 text-black group transition-all active:scale-95 shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-[0_0_40px_rgba(57,255,20,0.5)]">
<div class="flex items-center gap-6">
<span class="material-symbols-outlined text-5xl" data-icon="play_arrow" style="font-variation-settings: 'FILL' 1;">play_arrow</span>
<div class="text-left">
<p class="font-h1 text-3xl leading-none font-black tracking-tighter uppercase">PLAY MATCH</p>
<p class="text-[10px] font-bold opacity-70 tracking-widest mt-1">INITIATE TACTICAL SIMULATION</p>
</div>
</div>
<span class="material-symbols-outlined text-3xl group-hover:translate-x-2 transition-transform" data-icon="chevron_right">chevron_right</span>
</button>
</section>
<!-- SECONDARY ACTIONS GRID -->
<section class="grid grid-cols-2 md:grid-cols-1 gap-4">
<button class="glass-card h-24 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors border-white/5">
<span class="material-symbols-outlined text-[#39FF14]" data-icon="groups">groups</span>
<span class="font-label-caps text-[10px] tracking-widest text-white/80">ROSTER / TACTICS</span>
</button>
<button class="glass-card h-24 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors border-white/5">
<span class="material-symbols-outlined text-[#39FF14]" data-icon="swap_horiz">swap_horiz</span>
<span class="font-label-caps text-[10px] tracking-widest text-white/80 uppercase">Mercato (Draft)</span>
</button>
<button class="glass-card h-24 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-colors border-white/5 md:hidden">
<span class="material-symbols-outlined text-[#39FF14]" data-icon="shopping_cart">shopping_cart</span>
<span class="font-label-caps text-[10px] tracking-widest text-white/80 uppercase">Shop</span>
</button>
</section>
<!-- SHOP / UPGRADES (BENTO STYLE) -->
<section class="md:col-span-3 glass-card rounded-xl p-6 flex flex-col md:flex-row items-center justify-between border-white/5 bg-gradient-to-r from-transparent via-[#39FF14]/5 to-transparent">
<div class="flex items-center gap-6 mb-4 md:mb-0">
<div class="w-16 h-16 bg-[#121212] border border-white/10 rounded-sm flex items-center justify-center">
<span class="material-symbols-outlined text-[#39FF14] text-3xl" data-icon="bolt">bolt</span>
</div>
<div>
<h3 class="font-h2 text-white uppercase tracking-tighter">Command Center Upgrades</h3>
<p class="text-sm text-white/40">Unlock new tactical cards and training facilities.</p>
</div>
</div>
<button class="px-8 py-3 bg-transparent border border-[#39FF14] text-[#39FF14] font-label-caps tracking-widest hover:bg-[#39FF14]/10 transition-colors uppercase">
          SHOP / UPGRADES
        </button>
</section>
</div>
</main>
<!-- BOTTOM NAV BAR (MOBILE ONLY) -->
<nav class="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-2 py-3 bg-[#050505] border-t border-white/10 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
<a class="flex flex-col items-center justify-center bg-[#39FF14] text-black rounded-sm px-3 py-1 shadow-[0_0_15px_rgba(57,255,20,0.6)] scale-110" href="#">
<span class="material-symbols-outlined" data-icon="grid_view">grid_view</span>
<span class="font-['Space_Grotesk'] text-[8px] font-bold uppercase tracking-tighter">DASHBOARD</span>
</a>
<a class="flex flex-col items-center justify-center text-white/40 hover:text-[#39FF14]/80 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="groups">groups</span>
<span class="font-['Space_Grotesk'] text-[8px] font-bold uppercase tracking-tighter">ROSTER</span>
</a>
<a class="flex flex-col items-center justify-center text-white/40 hover:text-[#39FF14]/80 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="play_arrow">play_arrow</span>
<span class="font-['Space_Grotesk'] text-[8px] font-bold uppercase tracking-tighter">PLAY</span>
</a>
<a class="flex flex-col items-center justify-center text-white/40 hover:text-[#39FF14]/80 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="swap_horiz">swap_horiz</span>
<span class="font-['Space_Grotesk'] text-[8px] font-bold uppercase tracking-tighter">MERCATO</span>
</a>
<a class="flex flex-col items-center justify-center text-white/40 hover:text-[#39FF14]/80 transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
<span class="font-['Space_Grotesk'] text-[8px] font-bold uppercase tracking-tighter">SHOP</span>
</a>
</nav>
</body></html>


web application/stitch/projects/1034317792597852275/screens/85f5e2fac3c94e55aaa5961dcb9923b2
# Project Brief: Obsidian Athletics

## Project Overview
**Obsidian Athletics** is a mobile-first football management roguelite that blends deep tactical simulation with the fast-paced progression of a roguelite RPG. Players take on the role of a "Commander," building squads, managing tactics, and navigating a high-stakes league structure.

## Visual Identity (Obsidian Athletics)
- **Vibe:** Futuristic Sports Management, High-Tech, Cyberpunk-adjacent.
- **Color Palette:** 
  - Base: Deep Obsidian (#050505) and Dark Grey Glassmorphism (#121414).
  - Accent: Neon "Striker Green" (#39FF14) for primary actions and critical data.
- **Typography:** Space Grotesk (Bold/Uppercase) for a technical, tactical feel.
- **UI Patterns:** Glowing borders, high-contrast status indicators, and glassmorphic card containers.

## Technical Specifications
- **Framework:** React 19
- **Styling:** Tailwind CSS
- **Design Philosophy:** Mobile-First, responsive for desktop (PC), focus on glanceable RPG-style stats and high-density information architecture.

## Core User Journey
1. **The Hub:** Players land on the "Striker Command" dashboard to review squad health, current formation, and prestige currency.
2. **Tactical Planning:** Navigating the "Roster / Tactics" section to optimize the 4-4-2 (or custom) formation.
3. **The Mercato:** Drafting new talent and managing transfers to improve the squad's OVR rating.
4. **The Simulation:** Initiating a "Play Match" tactical simulation against upcoming opponents (e.g., Void Titans).
5. **Progression:** Using earned Prestige for "Command Center Upgrades" in the Shop to unlock tactical cards and training facilities.

## Screen List (Planned)
- **Management Hub (Dashboard):** [COMPLETED] Central command center for all operations.
- **Roster / Tactics:** Deep dive into player stats, individual instructions, and formation settings.
- **Mercato (Draft/Transfer):** Interface for acquiring new players via roguelite drafting mechanics.
- **Match Simulation:** The high-energy interface where tactical decisions play out against an opponent.
- **Shop & Command Center:** Meta-progression hub for permanent upgrades and cosmetic unlocks.
