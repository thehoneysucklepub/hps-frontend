<template>
  <div style="background:#0A0A0A;min-height:100vh;overflow-x:hidden;">

    <!-- ── HERO ── -->
    <div style="position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;">

      <!-- Animated background orbs -->
      <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <!-- Grid lines -->
        <div class="grid-overlay"></div>
      </div>

      <!-- Floating particles -->
      <div class="particles" aria-hidden="true">
        <div v-for="i in 20" :key="i" class="particle" :style="particleStyle(i)"></div>
      </div>

      <div style="position:relative;z-index:2;text-align:center;padding:0 24px;max-width:900px;">

        <!-- Eyebrow -->
        <div class="fade-in-up" style="animation-delay:0.1s;">
          <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:8px 20px;margin-bottom:32px;">
            <div style="width:6px;height:6px;background:#FF6B6B;border-radius:50%;animation:blink 2s infinite;"></div>
            <span style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;">Premium Experience · HoneysucklePub</span>
          </div>
        </div>

        <!-- Main title -->
        <div class="fade-in-up" style="animation-delay:0.2s;">
          <h1 class="bar-x-title">BAR X</h1>
        </div>

        <!-- Tagline -->
        <div class="fade-in-up" style="animation-delay:0.4s;">
          <p style="font-size:clamp(16px,2.5vw,22px);color:#666;letter-spacing:1px;margin-bottom:8px;font-weight:300;">
            Where sophistication meets celebration
          </p>
          <p style="font-size:14px;color:#444;margin-bottom:48px;line-height:1.8;max-width:500px;margin-left:auto;margin-right:auto;">
            A premium destination redefining nightlife in Accra. Crafted for those who appreciate the finer things.
          </p>
        </div>

        <!-- CTAs -->
        <div class="fade-in-up" style="animation-delay:0.6s;display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <v-btn
            color="white"
            size="large"
            style="font-weight:700;color:#0A0A0A;padding:0 36px;border-radius:100px;"
            to="/reservations"
          >
            Reserve Your Table
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
          <v-btn
            variant="outlined"
            size="large"
            style="border-color:rgba(255,255,255,0.15);color:#fff;padding:0 36px;border-radius:100px;"
            @click="scrollTo('experience')"
          >
            Discover More
          </v-btn>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;" @click="scrollTo('experience')">
        <span style="font-size:10px;letter-spacing:3px;color:#444;text-transform:uppercase;">Scroll</span>
        <div class="scroll-line"></div>
      </div>
    </div>

    <!-- ── STATS BAR ── -->
    <div style="border-top:1px solid #1A1A1A;border-bottom:1px solid #1A1A1A;background:#0D0D0D;">
      <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          style="padding:32px 24px;text-align:center;"
          :style="{ borderRight: i < stats.length - 1 ? '1px solid #1A1A1A' : 'none' }"
        >
          <div style="font-size:clamp(28px,4vw,42px);font-weight:900;background:linear-gradient(135deg,#FF6B6B,#6B6BFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            {{ stat.value }}
          </div>
          <div style="font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">
            {{ stat.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── EXPERIENCE SECTION ── -->
    <div id="experience" style="padding:120px 24px;max-width:1200px;margin:0 auto;">

      <div style="text-align:center;margin-bottom:80px;">
        <div style="font-size:11px;color:#FF6B6B;letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">
          What we offer
        </div>
        <h2 style="font-size:clamp(32px,5vw,56px);font-weight:900;line-height:1.1;">
          The <span class="gradient-text">BAR X</span> Experience
        </h2>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2px;background:#1A1A1A;border:1px solid #1A1A1A;border-radius:20px;overflow:hidden;">
        <div
          v-for="(feature, i) in features"
          :key="feature.title"
          class="feature-card"
          style="padding:48px 36px;position:relative;overflow:hidden;background:#0D0D0D;cursor:default;"
        >
          <!-- Number -->
          <div style="font-size:80px;font-weight:900;position:absolute;top:-10px;right:20px;opacity:0.04;color:#fff;line-height:1;pointer-events:none;">
            {{ String(i + 1).padStart(2, '0') }}
          </div>

          <!-- Icon -->
          <div
            style="width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;"
            :style="{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }"
          >
            <v-icon :color="feature.color" size="24">{{ feature.icon }}</v-icon>
          </div>

          <div style="font-size:20px;font-weight:800;margin-bottom:12px;color:#fff;">
            {{ feature.title }}
          </div>
          <p style="font-size:14px;color:#666;line-height:1.8;">{{ feature.desc }}</p>

          <!-- Hover accent line -->
          <div class="feature-accent" :style="{ background: feature.color }"></div>
        </div>
      </div>
    </div>

    <!-- ── SIGNATURE SECTION ── -->
    <div style="padding:120px 24px;background:#080808;border-top:1px solid #1A1A1A;border-bottom:1px solid #1A1A1A;">
      <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;" class="story-grid">

        <!-- Text -->
        <div>
          <div style="font-size:11px;color:#6B6BFF;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;">
            Our Story
          </div>
          <h2 style="font-size:clamp(28px,4vw,48px);font-weight:900;line-height:1.2;margin-bottom:24px;">
            Born from a vision of <span class="gradient-text">extraordinary</span> nights
          </h2>
          <p style="font-size:15px;color:#666;line-height:1.9;margin-bottom:20px;">
            BAR X represents the evolution of nightlife culture in Accra, where traditional Honeysuckle hospitality meets contemporary innovation. We've reimagined what it means to create spaces for human connection.
          </p>
          <p style="font-size:15px;color:#555;line-height:1.9;margin-bottom:40px;">
            Every element — from our handcrafted cocktails to our curated soundscape — has been thoughtfully designed to transcend the ordinary.
          </p>
          <div style="display:flex;gap:32px;">
            <div v-for="highlight in highlights" :key="highlight.label">
              <div style="font-size:24px;font-weight:900;color:#FF6B6B;">{{ highlight.value }}</div>
              <div style="font-size:12px;color:#555;margin-top:4px;">{{ highlight.label }}</div>
            </div>
          </div>
        </div>

        <!-- Visual -->
        <div style="position:relative;">
          <div class="story-visual">
            <div class="story-box story-box-1">
              <v-icon size="32" color="#FF6B6B">mdi-glass-cocktail</v-icon>
              <div style="margin-top:12px;font-size:14px;font-weight:700;color:#fff;">Craft Cocktails</div>
              <div style="font-size:12px;color:#555;margin-top:4px;">50+ signature drinks</div>
            </div>
            <div class="story-box story-box-2">
              <v-icon size="32" color="#6B6BFF">mdi-music-note</v-icon>
              <div style="margin-top:12px;font-size:14px;font-weight:700;color:#fff;">Live Music</div>
              <div style="font-size:12px;color:#555;margin-top:4px;">Every weekend</div>
            </div>
            <div class="story-box story-box-3">
              <v-icon size="32" color="#6BFFB8">mdi-star-four-points</v-icon>
              <div style="margin-top:12px;font-size:14px;font-weight:700;color:#fff;">VIP Experience</div>
              <div style="font-size:12px;color:#555;margin-top:4px;">Private bookings</div>
            </div>
            <div class="story-center-orb"></div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── SIGNATURE COCKTAILS ── -->
    <div style="padding:120px 24px;max-width:1200px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:80px;">
        <div style="font-size:11px;color:#6BFFB8;letter-spacing:4px;text-transform:uppercase;margin-bottom:16px;">Curated for you</div>
        <h2 style="font-size:clamp(28px,4vw,48px);font-weight:900;">Signature Cocktails</h2>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
        <div
          v-for="cocktail in cocktails"
          :key="cocktail.name"
          class="cocktail-card"
          style="background:#0D0D0D;border:1px solid #1A1A1A;border-radius:16px;padding:28px;position:relative;overflow:hidden;transition:all 0.3s;"
        >
          <div
            style="position:absolute;inset:0;opacity:0;transition:opacity 0.3s;"
            :style="{ background: `radial-gradient(ellipse at top left, ${cocktail.color}10, transparent)` }"
            class="cocktail-glow"
          ></div>
          <div style="font-size:32px;margin-bottom:16px;">{{ cocktail.emoji }}</div>
          <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:8px;">{{ cocktail.name }}</div>
          <div style="font-size:12px;color:#555;line-height:1.6;margin-bottom:16px;">{{ cocktail.desc }}</div>
          <div style="font-size:13px;font-weight:700;" :style="{ color: cocktail.color }">
            GHS {{ cocktail.price }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── CTA SECTION ── -->
    <div style="padding:120px 24px;position:relative;overflow:hidden;">
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(107,107,255,0.08) 0%,transparent 70%);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(255,107,107,0.06) 0%,transparent 60%);"></div>

      <div style="position:relative;z-index:1;max-width:700px;margin:0 auto;text-align:center;">
        <div style="font-size:11px;color:#888;letter-spacing:4px;text-transform:uppercase;margin-bottom:20px;">
          Ready for something extraordinary?
        </div>
        <h2 style="font-size:clamp(36px,6vw,72px);font-weight:900;line-height:1.1;margin-bottom:24px;">
          Visit <span class="gradient-text">BAR X</span> Tonight
        </h2>
        <p style="font-size:16px;color:#555;margin-bottom:48px;line-height:1.8;">
          Reserve your table and step into an experience unlike anything else in Accra. Limited seats available each night.
        </p>
        <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
          <v-btn
            color="white"
            size="x-large"
            style="font-weight:700;color:#0A0A0A;padding:0 48px;border-radius:100px;font-size:15px;"
            to="/reservations"
          >
            Reserve Now
          </v-btn>
          <v-btn
            variant="outlined"
            size="x-large"
            style="border-color:rgba(255,255,255,0.15);color:#fff;padding:0 48px;border-radius:100px;font-size:15px;"
            to="/contact"
          >
            Find Us
          </v-btn>
        </div>

        <!-- Social proof -->
        <div style="margin-top:48px;display:flex;align-items:center;justify-content:center;gap:16px;">
          <div style="display:flex;">
            <div
              v-for="i in 5"
              :key="i"
              style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FF6B6B,#6B6BFF);border:2px solid #0A0A0A;margin-left:-8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;"
            >
              {{ ['A','K','M','S','T'][i-1] }}
            </div>
          </div>
          <div style="font-size:13px;color:#555;">
            Join <span style="color:#fff;font-weight:700;">500+</span> guests who've experienced BAR X
          </div>
        </div>
      </div>
    </div>

    <!-- ── FOOTER NOTE ── -->
    <div style="border-top:1px solid #111111;padding:32px 24px;text-align:center;">
      <div style="font-size:12px;color:#333;letter-spacing:2px;">
        A PREMIUM DESTINATION BY <span style="color:#555;">HONEYSUCKLEPUB</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const settings = ref({})

const stats = [
  { value: '50+', label: 'Signature Cocktails' },
  { value: '500+', label: 'Happy Guests' },
  { value: '5★', label: 'Experience' },
  { value: '7PM', label: 'Opens Nightly' },
]

const highlights = [
  { value: '2021', label: 'Est. year' },
  { value: '500+', label: 'Guests served' },
  { value: '50+', label: 'Cocktails' },
]

const features = [
  {
    title: 'Craft Cocktails',
    icon: 'mdi-glass-cocktail',
    color: '#FF6B6B',
    desc: 'Meticulously crafted beverages using premium spirits and fresh ingredients. Our master mixologists create signature cocktails that define modern elegance and timeless sophistication.'
  },
  {
    title: 'Ambient Atmosphere',
    icon: 'mdi-ceiling-light',
    color: '#6B6BFF',
    desc: 'Immerse yourself in an environment designed for connection and conversation. Contemporary lighting and curated music create the perfect backdrop for memorable evenings.'
  },
  {
    title: 'Exceptional Service',
    icon: 'mdi-account-star',
    color: '#6BFFB8',
    desc: 'Our dedicated team ensures every visit exceeds expectations. From personalised recommendations to attentive hospitality, we are committed to creating extraordinary moments.'
  },
  {
    title: 'VIP Reservations',
    icon: 'mdi-crown',
    color: '#FFD700',
    desc: 'Secure your private space for special occasions. Our VIP packages include dedicated service, premium bottles, and bespoke setups tailored to your celebration.'
  },
  {
    title: 'Live Entertainment',
    icon: 'mdi-music-note',
    color: '#FF6BFF',
    desc: 'Experience world-class live performances every weekend. From jazz to Afrobeats, our curated music programme sets the tone for an unforgettable night.'
  },
  {
    title: 'Premium Location',
    icon: 'mdi-map-marker-star',
    color: '#FF9B6B',
    desc: 'Situated in the heart of Accra, BAR X is easily accessible and surrounded by the city\'s most vibrant energy. The perfect destination for any occasion.'
  },
]

const cocktails = [
  { name: 'X Noir',        emoji: '🖤', color: '#FF6B6B', price: '85', desc: 'Aged rum, blackberry, activated charcoal, citrus foam' },
  { name: 'Gold Rush',     emoji: '✨', color: '#FFD700', price: '90', desc: 'Bourbon, honey, lemon, gold leaf garnish' },
  { name: 'Violet Dreams', emoji: '💜', color: '#6B6BFF', price: '80', desc: 'Gin, butterfly pea flower, elderflower, tonic' },
  { name: 'Neon Tropics',  emoji: '🌴', color: '#6BFFB8', price: '75', desc: 'Coconut rum, mango, lime, neon sugar rim' },
  { name: 'The Crimson',   emoji: '🔴', color: '#FF4444', price: '95', desc: 'Premium vodka, blood orange, hibiscus, prosecco' },
  { name: 'Midnight Star', emoji: '⭐', color: '#888888', price: '85', desc: 'Silver tequila, smoky mezcal, agave, chilli salt' },
]

function particleStyle(i) {
  const size = Math.random() * 4 + 1
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 23 + 10) % 100}%`,
    animationDelay: `${(i * 0.3) % 4}s`,
    animationDuration: `${4 + (i % 4)}s`,
  }
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(async () => {
  try {
    const res = await api.get('/site_settings')
    res.data.settings.forEach(s => {
      settings.value[s.key] = s.value
    })
  } catch { /* silent */ }
})
</script>

<style scoped>
.bar-x-title {
  font-size: clamp(80px, 15vw, 180px);
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 0.9;
  background: linear-gradient(135deg, #FF6B6B 0%, #ffffff 40%, #6B6BFF 80%, #FF6B6B 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
  margin-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(135deg, #FF6B6B, #6B6BFF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(255,107,107,0.12), transparent);
  top: -200px; left: -100px;
  animation: floatOrb 12s ease-in-out infinite;
}
.orb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(107,107,255,0.1), transparent);
  bottom: -100px; right: -100px;
  animation: floatOrb 15s ease-in-out infinite reverse;
}
.orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(107,255,184,0.06), transparent);
  top: 40%; left: 50%;
  transform: translateX(-50%);
  animation: floatOrb 10s ease-in-out infinite 2s;
}

.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 20%, transparent 80%);
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  animation: particleFloat linear infinite;
}

.fade-in-up {
  animation: fadeInUp 0.8s ease forwards;
  opacity: 0;
}

.scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}

.feature-card {
  transition: background 0.3s;
}
.feature-card:hover {
  background: #111111 !important;
}
.feature-accent {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}
.feature-card:hover .feature-accent {
  transform: scaleX(1);
}

.story-grid {
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 768px) {
  .story-grid { grid-template-columns: 1fr !important; }
}

.story-visual {
  position: relative;
  height: 400px;
}
.story-box {
  position: absolute;
  background: #111111;
  border: 1px solid #2A2A2A;
  border-radius: 16px;
  padding: 24px;
  transition: transform 0.3s, border-color 0.3s;
}
.story-box:hover {
  transform: translateY(-4px);
}
.story-box-1 {
  top: 0; left: 0; width: 180px;
  animation: float 6s ease-in-out infinite;
}
.story-box-2 {
  top: 40px; right: 0; width: 180px;
  animation: float 6s ease-in-out infinite 1s;
}
.story-box-3 {
  bottom: 0; left: 50%; transform: translateX(-50%);
  width: 200px;
  animation: float 6s ease-in-out infinite 2s;
}
.story-center-orb {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(107,107,255,0.15), transparent);
  border: 1px solid rgba(107,107,255,0.1);
  animation: pulse 3s ease-in-out infinite;
}

.cocktail-card:hover {
  border-color: #333 !important;
  transform: translateY(-4px);
}
.cocktail-card:hover .cocktail-glow {
  opacity: 1 !important;
}

@keyframes shimmer {
  0% { background-position: 0% center; }
  100% { background-position: 200% center; }
}
@keyframes floatOrb {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(30px, -30px); }
  66% { transform: translate(-20px, 20px); }
}
@keyframes particleFloat {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.2; }
  100% { transform: translateY(-100vh) rotate(720deg); opacity: 0; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes scrollPulse {
  0%, 100% { opacity: 0.3; transform: scaleY(1); }
  50% { opacity: 1; transform: scaleY(1.1); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>