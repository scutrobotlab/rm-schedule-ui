export function StaticCDN(url: string): string {
  url = url.replace("https://rm-static.djicdn.com", "/api/static/rm-static_djicdn_com")
  url = url.replace("https://terra-cn-oss-cdn-public-pro.oss-cn-hangzhou.aliyuncs.com", "/api/static/terra-cn-oss-cdn-public-pro_oss-cn-hangzhou_aliyuncs_com")
  url = url.replace("https://pro-robomasters-hz-n5i3.oss-cn-hangzhou.aliyuncs.com", "/api/static/pro-robomasters-hz-n5i3_oss-cn-hangzhou_aliyuncs_com")
  url = url.replace("https://hz-rm-bbs-web-prod.oss-cn-hangzhou.aliyuncs.com", "/api/static/hz-rm-bbs-web-prod_oss-cn-hangzhou_aliyuncs_com")
  url = url.replace("https://terra-us-pro-rm-prod-pub-us.s3.amazonaws.com", "/api/static/terra-us-pro-rm-prod-pub-us_s3_amazonaws_com")
  return url
}
