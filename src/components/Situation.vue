<script setup lang="ts">
const selectedZone = ref([0])
</script>

<template>
  <div>
    <img
      class="background-image"
      src="@/assets/background2.jpg"
      alt=""/>

    <v-img
      class="logo"
      src="@/assets/logo.png">
    </v-img>

    <div class="container">
      <v-container class="content mt-2">
        <v-row>
          <v-col cols="12">
            <div>
              <v-carousel
                height="100vh - 100px"
                :disabled="true"
                hide-delimiters
                :show-arrows="false"
                v-model="selectedZone"
              >
                <v-carousel-item>
                  <SwissWheel zone="A"></SwissWheel>
                </v-carousel-item>
                <v-carousel-item>
                  <SwissWheel zone="B"></SwissWheel>
                </v-carousel-item>

              </v-carousel>
              <v-sheet
                class="mx-auto text-center"
              >
                <v-slide-group
                  v-model="selectedZone"
                  mandatory="force"
                >
                  <v-slide-group-item
                    v-for="n in ['A', 'B']"
                    :key="n"
                    v-slot="{ isSelected, toggle }"
                  >
                    <v-btn
                      :color="isSelected ? 'primary' : undefined"
                      class="ma-2"
                      rounded
                      @click="toggle">
                      半区 {{ n }}
                    </v-btn>
                  </v-slide-group-item>
                </v-slide-group>
              </v-sheet>
            </div>
          </v-col>
          <v-img
            src="@/assets/qr-code.png">
          </v-img>
        </v-row>
      </v-container>
    </div>
  </div>
</template>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh; /* 使容器的高度与视口高度一致 */
  overflow: hidden;
}

.background-image {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 1;
}

.logo {
  position: absolute;
  bottom: 50px;
  right: 0;
  width: 8%;
  opacity: 0.5;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 3;
}

.content {
  position: relative;
  z-index: 2;
}
</style>
