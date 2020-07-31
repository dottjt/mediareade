const toISOTimezoneString = (date: Date): string => {
  var tzo = - date.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = function(num) {
        var norm = Math.floor(Math.abs(num));
        return (norm < 10 ? '0' : '') + norm;
      };
  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      dif + pad(tzo / 60) +
      ':' + pad(tzo % 60);
}

export const toMelbourneDateString = (date: Date): string => {
  const aestTime = date.toLocaleString("en-US", {timeZone: "Australia/Melbourne"});
  const timeZoneDate = toISOTimezoneString(new Date(aestTime));

  return timeZoneDate;
}
