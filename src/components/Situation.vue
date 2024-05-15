<script setup lang="ts">
</script>

<template>
  <v-container>
    <div class="text-center mt-4">
      <h1 class="font-weight-bold">2024 机甲大师超级对抗赛 东部赛区</h1>
    </div>

    <div class="py-4"/>

    <v-row>
      <v-col cols="12">
        <v-card
          elevation="4"
        >
          <v-carousel
            height="100vh - 100px"
            hide-delimiters
            show-arrows="hover"
          >
            <v-carousel-item>
              <SwissWheel zone="A"></SwissWheel>
            </v-carousel-item>
            <v-carousel-item>
              <SwissWheel zone="B"></SwissWheel>
            </v-carousel-item>
          </v-carousel>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass">

</style>
