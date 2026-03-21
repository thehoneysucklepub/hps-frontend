<template>
  <div style="background:#0A0A0A;min-height:100vh;">

    <!-- Hero -->
    <div style="position:relative;height:70vh;min-height:520px;max-height:720px;display:flex;align-items:center;justify-content:center;overflow:hidden;">

      <!-- Background image -->
      <div style="position:absolute;inset:0;background-image:url('https://images.unsplash.com/photo-1574096079513-d8259312b785?w=1800&q=80');background-size:cover;background-position:center;background-repeat:no-repeat;"></div>

      <!-- Overlays -->
      <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,10,0.9) 0%,rgba(20,14,0,0.78) 50%,rgba(10,10,10,0.88) 100%);"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 60% 40%,rgba(245,197,24,0.07) 0%,transparent 65%);"></div>

      <!-- Corner bracket decorations -->
      <div style="position:absolute;top:32px;left:32px;width:40px;height:40px;border-top:1.5px solid rgba(245,197,24,0.4);border-left:1.5px solid rgba(245,197,24,0.4);border-radius:2px 0 0 0;pointer-events:none;"></div>
      <div style="position:absolute;top:32px;right:32px;width:40px;height:40px;border-top:1.5px solid rgba(245,197,24,0.4);border-right:1.5px solid rgba(245,197,24,0.4);border-radius:0 2px 0 0;pointer-events:none;"></div>
      <div style="position:absolute;bottom:32px;left:32px;width:40px;height:40px;border-bottom:1.5px solid rgba(245,197,24,0.4);border-left:1.5px solid rgba(245,197,24,0.4);border-radius:0 0 0 2px;pointer-events:none;"></div>
      <div style="position:absolute;bottom:32px;right:32px;width:40px;height:40px;border-bottom:1.5px solid rgba(245,197,24,0.4);border-right:1.5px solid rgba(245,197,24,0.4);border-radius:0 0 2px 0;pointer-events:none;"></div>

      <!-- Animated gold lines -->
      <div style="position:absolute;inset:0;overflow:hidden;pointer-events:none;">
        <div v-for="i in 3" :key="i" :style="goldLineStyle(i)"></div>
      </div>

      <!-- Hero Content -->
      <div style="position:relative;z-index:1;text-align:center;padding:0 24px;max-width:700px;">
        <!-- Eyebrow pill -->
        <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,197,24,0.08);border:1px solid rgba(245,197,24,0.2);border-radius:100px;padding:5px 18px;margin-bottom:20px;">
          <div style="width:5px;height:5px;border-radius:50%;background:#F5C518;animation:heroPulse 2s infinite;"></div>
          <span style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Sports Bar · Pub · Restaurant</span>
        </div>

        <h1 style="font-size:clamp(38px,6vw,64px);font-weight:900;line-height:1.05;margin:0 0 16px;color:#fff;letter-spacing:-1px;">
          The <span style="color:#F5C518;">Honeysuckle</span> Pub
        </h1>

        <p style="font-size:clamp(14px,1.6vw,16px);color:#666;margin:0 auto 32px;line-height:1.8;max-width:440px;">
          Catch every game and moment. Your premium sports viewing destination across Accra.
        </p>

        <!-- CTA buttons -->
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <v-btn
            color="primary"
            size="large"
            style="color:#0A0A0A;font-weight:700;padding:0 28px;border-radius:10px;"
            to="/live-sports"
          >
            <v-icon start size="16">mdi-broadcast</v-icon>
            Live Sports
          </v-btn>
          <v-btn
            variant="outlined"
            color="primary"
            size="large"
            style="padding:0 28px;border-radius:10px;"
            to="/branches"
          >
            Our Locations
          </v-btn>
          <v-btn
            variant="text"
            size="large"
            style="padding:0 28px;border-radius:10px;border:1px solid #2A2A2A;color:#888;"
            to="/reservations"
          >
            Reserve a Table
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Gold accent line -->
    <div style="height:2px;background:linear-gradient(90deg,transparent,rgba(245,197,24,0.5) 30%,rgba(245,197,24,0.8) 50%,rgba(245,197,24,0.5) 70%,transparent);"></div>

    <!-- Stats bar -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);background:#111111;border-bottom:1px solid #1E1E1E;">
      <div
        v-for="(stat, i) in statBar"
        :key="stat.label"
        style="padding:20px 24px;text-align:center;"
        :style="{ borderRight: i < statBar.length - 1 ? '1px solid #1E1E1E' : 'none' }"
      >
        <div style="font-size:22px;font-weight:900;color:#F5C518;">{{ stat.value }}</div>
        <div style="font-size:10px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Upcoming Events -->
    <div style="padding:80px 24px;max-width:1200px;margin:0 auto;">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:40px;flex-wrap:wrap;gap:16px;">
        <div>
          <div style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Showing from now to next year</div>
          <h2 style="font-size:clamp(24px,4vw,38px);font-weight:800;margin:0;">Catch every Game and Moment</h2>
        </div>
        <v-btn variant="text" color="primary" to="/live-sports" style="font-size:13px;">
          View all <v-icon end size="16">mdi-arrow-right</v-icon>
        </v-btn>
      </div>

      <div v-if="loadingEvents" style="display:flex;justify-content:center;padding:60px 0;">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <div v-else style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="event-card"
          style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;cursor:pointer;transition:border-color 0.2s,transform 0.2s;"
          @mouseenter="e => { e.currentTarget.style.borderColor='#F5C518'; e.currentTarget.style.transform='translateY(-2px)'; }"
          @mouseleave="e => { e.currentTarget.style.borderColor='#2A2A2A'; e.currentTarget.style.transform='translateY(0)'; }"
        >
          <div style="padding:20px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <span style="font-size:10px;color:#F5C518;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
                {{ event.league_or_category || event.event_type }}
              </span>
              <v-chip v-if="event.status === 'live'" color="error" size="x-small" style="font-weight:700;animation:heroPulse 1.5s infinite;">LIVE</v-chip>
            </div>
            <div style="font-size:15px;font-weight:700;margin-bottom:14px;line-height:1.4;">{{ event.title }}</div>
            <div style="display:flex;align-items:center;gap:14px;font-size:12px;color:#888;margin-bottom:4px;">
              <span style="display:flex;align-items:center;gap:4px;">
                <v-icon size="12" color="primary">mdi-calendar</v-icon>
                {{ formatDate(event.date_start) }}
              </span>
              <span v-if="event.time_local" style="display:flex;align-items:center;gap:4px;">
                <v-icon size="12" color="primary">mdi-clock-outline</v-icon>
                {{ event.time_local }}
              </span>
            </div>
            <div v-if="event.branch_name" style="font-size:12px;color:#888;display:flex;align-items:center;gap:4px;margin-bottom:16px;">
              <v-icon size="12" color="primary">mdi-map-marker</v-icon>
              {{ event.branch_name }}
            </div>
            <v-btn color="primary" size="small" block style="color:#0A0A0A;font-weight:700;border-radius:8px;" @click="openBooking(event)">
              <v-icon start size="13">mdi-calendar-check</v-icon>
              Book Spot
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- This Week -->
    <div style="background:#111111;border-top:1px solid #1E1E1E;border-bottom:1px solid #1E1E1E;padding:72px 24px;">
      <div style="max-width:1200px;margin:0 auto;">
        <div style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Showing this week</div>
        <h2 style="font-size:clamp(22px,3vw,32px);font-weight:800;margin:0 0 36px;">This Week's Highlights</h2>

        <div v-if="weekEvents.length === 0" style="text-align:center;padding:40px;color:#555;">
          No events scheduled this week.
        </div>

        <div v-else style="display:flex;gap:14px;overflow-x:auto;padding-bottom:12px;">
          <div
            v-for="event in weekEvents"
            :key="event.id"
            style="min-width:220px;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:12px;padding:20px;flex-shrink:0;transition:border-color 0.2s;"
            @mouseenter="e => e.currentTarget.style.borderColor='#F5C518'"
            @mouseleave="e => e.currentTarget.style.borderColor='#2A2A2A'"
          >
            <div style="font-size:10px;color:#F5C518;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">{{ event.league_or_category }}</div>
            <div style="font-size:14px;font-weight:700;margin-bottom:12px;line-height:1.4;">{{ event.title }}</div>
            <div style="font-size:11px;color:#666;">{{ formatDate(event.date_start) }} · {{ event.time_local }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!-- LOYALTY REWARDS SECTION                                 -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div style="position:relative;padding:100px 24px;overflow:hidden;background:#0A0A0A;">

      <!-- Radial gold glow behind content -->
      <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(245,197,24,0.05) 0%,transparent 70%);pointer-events:none;"></div>

      <!-- Faint large text watermark -->
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:clamp(80px,15vw,180px);font-weight:900;color:rgba(245,197,24,0.025);white-space:nowrap;letter-spacing:-4px;pointer-events:none;user-select:none;">REWARDS</div>

      <div style="max-width:1200px;margin:0 auto;position:relative;z-index:1;">

        <!-- Section header -->
        <div style="text-align:center;margin-bottom:72px;">
          <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(245,197,24,0.08);border:1px solid rgba(245,197,24,0.2);border-radius:100px;padding:5px 18px;margin-bottom:24px;">
            <div style="width:5px;height:5px;border-radius:50%;background:#F5C518;animation:heroPulse 2s infinite;"></div>
            <span style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Honeysuckle Rewards</span>
          </div>
          <h2 style="font-size:clamp(32px,5vw,58px);font-weight:900;margin:0 0 16px;line-height:1.05;letter-spacing:-1px;">
            Every visit<br><span style="color:#F5C518;">earns you more.</span>
          </h2>
          <p style="font-size:clamp(14px,1.6vw,17px);color:#555;max-width:480px;margin:0 auto;line-height:1.8;">
            Join Honeysuckle Rewards — free forever — and start turning every beer, wing, and game night into points that pay you back.
          </p>
        </div>

        <!-- Main two-column layout -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;margin-bottom:24px;">

          <!-- Left: How it works -->
          <div style="background:#111111;border:1px solid #1E1E1E;border-radius:20px;padding:40px;">
            <div style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;font-weight:600;">How it works</div>
            <h3 style="font-size:26px;font-weight:900;margin:0 0 32px;line-height:1.2;">Earn. Redeem.<br>Repeat.</h3>

            <div style="display:flex;flex-direction:column;gap:28px;">
              <!-- Step 1 -->
              <div style="display:flex;gap:20px;align-items:flex-start;">
                <div style="flex-shrink:0;width:40px;height:40px;border-radius:10px;background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.2);display:flex;align-items:center;justify-content:center;">
                  <v-icon size="18" color="primary">mdi-walk</v-icon>
                </div>
                <div>
                  <div style="font-size:14px;font-weight:700;margin-bottom:4px;">Visit &amp; Spend</div>
                  <div style="font-size:13px;color:#555;line-height:1.6;">Earn 1 point for every GHC 5 spent across all Honeysuckle branches.</div>
                </div>
              </div>
              <!-- Connector line -->
              <div style="margin-left:20px;width:1px;height:16px;background:linear-gradient(to bottom,rgba(245,197,24,0.3),transparent);"></div>
              <!-- Step 2 -->
              <div style="display:flex;gap:20px;align-items:flex-start;">
                <div style="flex-shrink:0;width:40px;height:40px;border-radius:10px;background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.2);display:flex;align-items:center;justify-content:center;">
                  <v-icon size="18" color="primary">mdi-chart-line</v-icon>
                </div>
                <div>
                  <div style="font-size:14px;font-weight:700;margin-bottom:4px;">Accumulate Points</div>
                  <div style="font-size:13px;color:#555;line-height:1.6;">Track your points in real-time on your digital membership card.</div>
                </div>
              </div>
              <!-- Connector line -->
              <div style="margin-left:20px;width:1px;height:16px;background:linear-gradient(to bottom,rgba(245,197,24,0.3),transparent);"></div>
              <!-- Step 3 -->
              <div style="display:flex;gap:20px;align-items:flex-start;">
                <div style="flex-shrink:0;width:40px;height:40px;border-radius:10px;background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.2);display:flex;align-items:center;justify-content:center;">
                  <v-icon size="18" color="primary">mdi-gift-outline</v-icon>
                </div>
                <div>
                  <div style="font-size:14px;font-weight:700;margin-bottom:4px;">Redeem Rewards</div>
                  <div style="font-size:13px;color:#555;line-height:1.6;">Trade your points for free drinks, sides, wings, and exclusive experiences.</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: What points unlock -->
          <div style="background:#111111;border:1px solid #1E1E1E;border-radius:20px;padding:40px;">
            <div style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;font-weight:600;">Rewards</div>
            <h3 style="font-size:26px;font-weight:900;margin:0 0 28px;">What your points unlock</h3>

            <div style="display:flex;flex-direction:column;gap:2px;">
              <div
                v-for="(reward, i) in rewards"
                :key="reward.pts"
                style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-radius:10px;transition:background 0.2s;"
                :style="{ background: i % 2 === 0 ? '#161616' : 'transparent' }"
              >
                <div style="display:flex;align-items:center;gap:14px;">
                  <div style="font-size:13px;font-weight:800;color:#F5C518;min-width:52px;">{{ reward.pts }} pts</div>
                  <div style="font-size:13px;color:#888;">{{ reward.label }}</div>
                </div>
                <div v-if="reward.tag" style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:100px;"
                  :style="{ background: reward.tag === 'Popular' ? 'rgba(245,197,24,0.12)' : 'rgba(100,200,120,0.1)', color: reward.tag === 'Popular' ? '#F5C518' : '#6DC87A', border: reward.tag === 'Popular' ? '1px solid rgba(245,197,24,0.25)' : '1px solid rgba(100,200,120,0.2)' }">
                  {{ reward.tag }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom: Premium card (full width) -->
        <div style="position:relative;background:#111111;border:1px solid #2A2A2A;border-radius:20px;overflow:hidden;">

          <!-- Gold shimmer top border -->
          <div style="height:2px;background:linear-gradient(90deg,transparent,rgba(245,197,24,0.6) 30%,#F5C518 50%,rgba(245,197,24,0.6) 70%,transparent);"></div>

          <!-- Subtle gold radial inside card -->
          <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(245,197,24,0.04) 0%,transparent 60%);pointer-events:none;"></div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0;align-items:center;padding:52px 48px;">

            <!-- Left text side -->
            <div style="padding-right:48px;border-right:1px solid #1E1E1E;">
              <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(245,197,24,0.08);border:1px solid rgba(245,197,24,0.2);border-radius:6px;padding:4px 12px;margin-bottom:20px;">
                <v-icon size="13" color="primary">mdi-star-four-points</v-icon>
                <span style="font-size:10px;color:#F5C518;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Premium</span>
              </div>
              <h3 style="font-size:clamp(28px,4vw,44px);font-weight:900;margin:0 0 16px;line-height:1.05;letter-spacing:-0.5px;">
                Honeysuckle<span style="color:#F5C518;">+</span>
              </h3>
              <p style="font-size:14px;color:#555;line-height:1.8;margin:0 0 28px;max-width:380px;">
                The premium tier for those who live at Honeysuckle. Get discounts on wings every visit, earn points faster, and unlock founding member status — limited to 200 members only.
              </p>
              <div style="display:flex;align-items:center;gap:6px;font-size:13px;color:#444;margin-bottom:28px;">
                <v-icon size="14" color="#444">mdi-account-group-outline</v-icon>
                Founding Member spots are filling fast
              </div>
              <a href="https://loyalty.honeysucklepub.com" target="_blank" rel="noopener" style="text-decoration:none;">
                <div
                  class="loyalty-cta-btn"
                  style="display:inline-flex;align-items:center;gap:10px;background:#F5C518;color:#0A0A0A;font-weight:800;font-size:14px;padding:14px 28px;border-radius:12px;cursor:pointer;transition:all 0.2s;letter-spacing:0.2px;"
                  @mouseenter="e => { e.currentTarget.style.background='#FFD700'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(245,197,24,0.25)'; }"
                  @mouseleave="e => { e.currentTarget.style.background='#F5C518'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }"
                >
                  <v-icon size="16">mdi-crown-outline</v-icon>
                  Claim your Founding Spot
                  <v-icon size="14">mdi-arrow-right</v-icon>
                </div>
              </a>
            </div>

            <!-- Right: perks list -->
            <div style="padding-left:48px;">
              <div style="font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">What you get</div>
              <div style="display:flex;flex-direction:column;gap:16px;">
                <div v-for="perk in perks" :key="perk" style="display:flex;align-items:center;gap:12px;">
                  <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:rgba(245,197,24,0.1);border:1px solid rgba(245,197,24,0.3);display:flex;align-items:center;justify-content:center;">
                    <v-icon size="11" color="primary">mdi-check</v-icon>
                  </div>
                  <span style="font-size:14px;color:#CCCCCC;">{{ perk }}</span>
                </div>
              </div>

              <!-- Price callout -->
              <div style="margin-top:32px;padding:20px 24px;background:#1A1A1A;border:1px solid #2A2A2A;border-radius:14px;">
                <div style="font-size:10px;color:#555;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Founding Member Rate</div>
                <div style="display:flex;align-items:baseline;gap:4px;">
                  <span style="font-size:38px;font-weight:900;color:#F5C518;line-height:1;">GHC 80</span>
                  <span style="font-size:13px;color:#555;">/month</span>
                </div>
                <div style="font-size:12px;color:#444;margin-top:6px;">Break even in just 3 visits</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom CTA strip -->
        <div style="margin-top:24px;background:#111111;border:1px solid #1E1E1E;border-radius:16px;padding:32px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;">
          <div>
            <div style="font-size:18px;font-weight:800;margin-bottom:4px;">Free to join. Instant rewards.</div>
            <div style="font-size:13px;color:#555;">No credit card needed — start earning points on your very next visit.</div>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <a href="https://loyalty.honeysucklepub.com" target="_blank" rel="noopener" style="text-decoration:none;">
              <div
                style="display:inline-flex;align-items:center;gap:8px;background:#F5C518;color:#0A0A0A;font-weight:800;font-size:13px;padding:12px 24px;border-radius:10px;cursor:pointer;transition:all 0.2s;"
                @mouseenter="e => { e.currentTarget.style.background='#FFD700'; e.currentTarget.style.transform='translateY(-1px)'; }"
                @mouseleave="e => { e.currentTarget.style.background='#F5C518'; e.currentTarget.style.transform='translateY(0)'; }"
              >
                <v-icon size="15">mdi-medal-outline</v-icon>
                Join Rewards — Free
              </div>
            </a>
            <a href="https://loyalty.honeysucklepub.com" target="_blank" rel="noopener" style="text-decoration:none;">
              <div
                style="display:inline-flex;align-items:center;gap:8px;background:transparent;color:#888;font-weight:600;font-size:13px;padding:12px 24px;border-radius:10px;cursor:pointer;border:1px solid #2A2A2A;transition:all 0.2s;"
                @mouseenter="e => { e.currentTarget.style.borderColor='#F5C518'; e.currentTarget.style.color='#F5C518'; }"
                @mouseleave="e => { e.currentTarget.style.borderColor='#2A2A2A'; e.currentTarget.style.color='#888'; }"
              >
                Sign In
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
    <!-- ═══════════════════════════════════════════════════════ -->

    <!-- Gold accent line -->
    <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(245,197,24,0.3) 30%,rgba(245,197,24,0.5) 50%,rgba(245,197,24,0.3) 70%,transparent);"></div>

    <!-- Branches -->
    <div style="padding:80px 24px;max-width:1200px;margin:0 auto;">
      <div style="font-size:10px;color:#F5C518;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">Perfect place to watch the game</div>
      <h2 style="font-size:clamp(22px,3vw,32px);font-weight:800;margin:0 0 36px;">Our Locations</h2>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;">
        <div
          v-for="branch in branches"
          :key="branch.id"
          style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:24px;cursor:pointer;transition:border-color 0.2s,transform 0.2s;"
          @mouseenter="e => { e.currentTarget.style.borderColor='#F5C518'; e.currentTarget.style.transform='translateY(-2px)'; }"
          @mouseleave="e => { e.currentTarget.style.borderColor='#2A2A2A'; e.currentTarget.style.transform='translateY(0)'; }"
          @click="$router.push(`/branches/${branch.slug}`)"
        >
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
            <div style="font-size:17px;font-weight:800;color:#F5C518;">{{ branch.name }}</div>
            <div style="font-size:10px;color:#444;background:#1A1A1A;padding:2px 10px;border-radius:100px;border:1px solid #2A2A2A;">est.{{ branch.established_year }}</div>
          </div>
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px;font-size:13px;color:#777;">
            <v-icon size="13" color="primary" style="margin-top:1px;">mdi-map-marker</v-icon>
            {{ branch.address }}
          </div>
          <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:#777;">
            <v-icon size="13" color="primary">mdi-phone</v-icon>
            {{ branch.phone_primary }}
          </div>
        </div>
      </div>
    </div>

    <!-- Book Event Dialog -->
    <v-dialog v-model="bookDialog" max-width="500" persistent>
      <v-card style="background:#111111;border:1px solid #2A2A2A;">
        <div class="d-flex align-center justify-space-between pa-5 pb-4" style="border-bottom:1px solid #2A2A2A;">
          <div style="font-size:17px;font-weight:700;">Book Event Spot</div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="bookDialog = false" />
        </div>
        <div class="pa-5">
          <div style="background:#1A1A1A;border-radius:10px;padding:16px;margin-bottom:20px;">
            <div style="font-size:15px;font-weight:700;margin-bottom:4px;">{{ bookingEvent?.title }}</div>
            <div style="font-size:13px;color:#888;">{{ formatDate(bookingEvent?.date_start) }} · {{ bookingEvent?.time_local }}</div>
          </div>
          <div style="margin-bottom:16px;">
            <div style="font-size:11px;color:#F5C518;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Choose branch to watch at *</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;">
              <div
                v-for="branch in branches"
                :key="branch.id"
                style="border-radius:10px;padding:12px;cursor:pointer;transition:all 0.2s;text-align:center;"
                :style="{
                  background: bookForm.branch_id === branch.id ? 'rgba(245,197,24,0.15)' : '#1A1A1A',
                  border: bookForm.branch_id === branch.id ? '1px solid #F5C518' : '1px solid #2A2A2A'
                }"
                @click="bookForm.branch_id = branch.id"
              >
                <v-icon size="18" :color="bookForm.branch_id === branch.id ? 'primary' : '#555'" class="mb-1">mdi-store</v-icon>
                <div style="font-size:11px;font-weight:600;" :style="{ color: bookForm.branch_id === branch.id ? '#F5C518' : '#888' }">
                  {{ branch.name }}
                </div>
              </div>
            </div>
          </div>
          <v-text-field v-model="bookForm.guests" label="Guests *" type="number" min="1" max="20" hide-details density="compact" bg-color="#1A1A1A" class="mb-3" />
          <v-textarea v-model="bookForm.notes" label="Special Notes" hide-details density="compact" bg-color="#1A1A1A" rows="2" />
          <v-alert v-if="bookError" type="error" variant="tonal" density="compact" class="mt-3">{{ bookError }}</v-alert>
        </div>
        <div class="d-flex justify-end ga-2 pa-5 pt-0">
          <v-btn variant="text" @click="bookDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="bookSaving" style="color:#0A0A0A;font-weight:700;" @click="submitBooking">Confirm Booking</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="5000" location="top right">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" size="small" to="/member/bookings">View</v-btn>
      </template>
    </v-snackbar>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const upcomingEvents = ref([])
const weekEvents     = ref([])
const branches       = ref([])
const loadingEvents  = ref(true)

const auth   = useAuthStore()
const router = useRouter()

const bookDialog   = ref(false)
const bookingEvent = ref(null)
const bookSaving   = ref(false)
const bookError    = ref(null)
const bookForm     = ref({ branch_id: null, guests: 1, notes: '' })
const snackbar     = ref({ show: false, text: '', color: 'success' })

const statBar = [
  { value: '3+',    label: 'Locations' },
  { value: 'Daily', label: 'Live Events' },
  { value: '20+',   label: 'Screens' },
  { value: '7PM',   label: 'Opens Daily' },
]

const rewards = [
  { pts: 50,  label: 'Free soft drink, dip, or small add-on', tag: 'Popular' },
  { pts: 100, label: 'Free side dish or local beer',          tag: null     },
  { pts: 120, label: 'Free draught beer of your choice',      tag: null     },
  { pts: 150, label: '10% discount voucher on total bill',    tag: null     },
  { pts: 200, label: 'Free classic wings portion',            tag: 'Best Value' },
]

const perks = [
  'GHC 27 off wings every visit',
  '1.5× points multiplier',
  'Access to exclusive rewards',
  'Priority event access',
  'Status recognition — all branches',
  'Break even in just 3 visits',
]

function openBooking(event) {
  if (!auth.isAuthenticated) { router.push('/register'); return }
  bookingEvent.value = event
  bookForm.value     = { branch_id: event.branch_id || null, guests: 1, notes: '' }
  bookError.value    = null
  bookDialog.value   = true
}

async function submitBooking() {
  if (!bookForm.value.branch_id) { bookError.value = 'Please select a branch'; return }
  bookSaving.value = true
  bookError.value  = null
  try {
    const res = await api.post('/event_bookings', {
      event_id:  bookingEvent.value.id,
      branch_id: bookForm.value.branch_id,
      guests:    bookForm.value.guests,
      notes:     bookForm.value.notes
    })
    bookDialog.value = false
    snackbar.value   = { show: true, text: `Booked! Code: ${res.data.booking.confirmation_code}`, color: 'success' }
  } catch (err) {
    bookError.value = err.response?.data?.error || 'Booking failed'
  } finally {
    bookSaving.value = false
  }
}

function goldLineStyle(i) {
  const styles = [
    { width:'1px', height:'200px', background:'linear-gradient(to bottom,transparent,rgba(245,197,24,0.25),transparent)', position:'absolute', top:'20%', left:'15%', transform:'rotate(45deg)', animation:'float1 6s ease-in-out infinite' },
    { width:'1px', height:'300px', background:'linear-gradient(to bottom,transparent,rgba(245,197,24,0.15),transparent)', position:'absolute', top:'40%', right:'20%', transform:'rotate(-30deg)', animation:'float2 8s ease-in-out infinite' },
    { width:'1px', height:'150px', background:'linear-gradient(to bottom,transparent,rgba(245,197,24,0.12),transparent)', position:'absolute', bottom:'30%', left:'40%', transform:'rotate(60deg)', animation:'float1 7s ease-in-out infinite 1s' },
  ]
  return styles[i - 1]
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const [upcomingRes, weekRes, branchRes] = await Promise.all([
      api.get('/events/upcoming'),
      api.get('/events/this_week'),
      api.get('/branches')
    ])
    upcomingEvents.value = upcomingRes.data.events
    weekEvents.value     = weekRes.data.events
    branches.value       = branchRes.data.branches
  } finally {
    loadingEvents.value = false
  }
})
</script>

<style>
@keyframes heroPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes float1 {
  0%, 100% { transform: rotate(45deg) translateY(0); }
  50% { transform: rotate(45deg) translateY(-20px); }
}
@keyframes float2 {
  0%, 100% { transform: rotate(-30deg) translateY(0); }
  50% { transform: rotate(-30deg) translateY(20px); }
}
</style>