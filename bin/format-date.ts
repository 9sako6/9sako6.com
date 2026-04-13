const formatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "long",
  timeZone: "Asia/Tokyo"
});

export function formatPostDate(isoString: string): string {
  return formatter.format(new Date(isoString));
}
