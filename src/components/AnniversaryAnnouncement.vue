<script setup lang="ts">
import { useAppStore } from "../stores/app";
import { AnniversaryVersionCode, AnniversaryVersionCodeKey } from "../constant/common";

const appStore = useAppStore()

const products = [
  {
    name: '虎虎小铺',
    description: '华南虎战队官方周边商城',
    logo: new URL('@/assets/huhu_store_logo.png', import.meta.url).href,
    link: 'https://store.scutbot.cn/',
  },
  {
    name: 'RM Search',
    description: '励志做全 RM 最好用的搜索引擎',
    logo: new URL('@/assets/rm_search_logo.svg', import.meta.url).href,
    link: 'https://search.scutbot.cn/',
  },
  {
    name: 'RM Extension',
    description: '扩展 RM 无限可能',
    logo: new URL('@/assets/rm_extension_logo.png', import.meta.url).href,
    link: 'https://microsoftedge.microsoft.com/addons/detail/rm-extension-%E6%89%A9%E5%B1%95-rm-%E6%97%A0%E9%99%90%E5%8F%AF%E8%83%BD/gijjamcbbihnmmihpifeloolebhboife',
  },
  {
    name: 'RMLive',
    description: '更清晰的赛事视图，更顺滑的直播体验',
    logo: new URL('@/assets/rmlive_logo.svg', import.meta.url).href,
    link: 'https://rmlive.scutbot.cn/',
  },
  {
    name: 'RoboSouls',
    description: 'RoboMaster 赛事模拟器',
    logo: new URL('@/assets/robosouls_logo.svg', import.meta.url).href,
    link: 'https://store.steampowered.com/app/3712750/RoboSouls/',
  },
  {
    name: 'HR Go',
    description: '华南虎招新面试系统（存档）',
    logoText: 'HR',
    link: 'https://github.com/scutrobotlab/HR_Go',
  },
]

function rememberAnniversaryAnnouncement() {
  localStorage.setItem(AnniversaryVersionCodeKey, AnniversaryVersionCode.toString())
}

function onDialogModelUpdate(isOpen: boolean) {
  if (!isOpen) {
    rememberAnniversaryAnnouncement()
  }
}

function closeDialog() {
  appStore.anniversaryAnnouncementDialog = false
  rememberAnniversaryAnnouncement()
}
</script>

<template>
  <v-dialog
    v-model="appStore.anniversaryAnnouncementDialog"
    width="100%"
    max-width="720"
    @update:model-value="onDialogModelUpdate"
  >
    <v-card class="anniversary-card">
      <img
        class="anniversary-image"
        src="@/assets/three_years_same_frequency.jpg"
        alt="三年同行热爱同频"
      />

      <v-card-text class="anniversary-content text-center">
        <h3>
          今年是 RM Schedule 陪伴 RoboMaster 走进的第三个赛季
        </h3>
        <p>
          欢迎继续下滑浏览我们的其他产品
        </p>

        <div class="product-section text-start">
          <div class="product-grid">
            <a
              v-for="product in products"
              :key="product.name"
              class="product-card"
              :href="product.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                v-if="product.logo"
                class="product-logo"
                :src="product.logo"
                :alt="product.name"
              />
              <div
                v-else
                class="product-logo product-logo-placeholder"
              >
                {{ product.logoText }}
              </div>
              <div>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-description">{{ product.description }}</div>
              </div>
            </a>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="关闭"
          variant="outlined"
          @click="closeDialog"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="scss">
.anniversary-card {
  width: 100%;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.anniversary-image {
  display: block;
  width: 100%;
  height: auto;
}

.anniversary-content {
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
  }

  p {
    margin-top: 12px;
    font-size: 1.05rem;
  }
}

.product-section {
  margin-top: 24px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: inherit;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
}

.product-logo {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.product-logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
}

.product-name {
  font-weight: 700;
}

.product-description {
  margin-top: 2px;
  font-size: 0.85rem;
  opacity: 0.72;
}

@media (max-width: 720px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
