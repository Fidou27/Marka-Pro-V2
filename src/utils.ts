/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const fmt = (n: number | string, d: number = 2): string => {
  const num = Number(n) || 0;
  return num
    .toFixed(d)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const safe = (t: string | null | undefined): string => {
  return String(t || '').replace(/[&<>"'\/]/g, '');
};

// Pure TypeScript Arabic Tafqeet (Spelling numbers out in Arabic)
export function numToAr(n: number): string {
  if (!n || isNaN(n)) return 'صفر';
  const num = Math.floor(n);
  
  const u = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const t = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const h = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  const sp: { [key: number]: string } = {
    10: 'عشرة',
    11: 'أحد عشر',
    12: 'اثنا عشر',
    13: 'ثلاثة عشر',
    14: 'أربعة عشر',
    15: 'خمسة عشر',
    16: 'ستة عشر',
    17: 'سبعة عشر',
    18: 'ثمانية عشر',
    19: 'تسعة عشر'
  };

  function checkHundredsTensOnes(x: number): string {
    if (!x) return '';
    let r = '';
    const hd = Math.floor(x / 100);
    const rm = x % 100;

    if (hd) {
      r += h[hd];
    }
    if (rm) {
      if (hd) r += ' و';
      if (rm < 10) {
        r += u[rm];
      } else if (rm < 20) {
        r += sp[rm];
      } else {
        const td = Math.floor(rm / 10);
        const ud = rm % 10;
        r += ud ? u[ud] + ' و' + t[td] : t[td];
      }
    }
    return r;
  }

  const bl = Math.floor(num / 1e9);
  const ml = Math.floor((num % 1e9) / 1e6);
  const tl = Math.floor((num % 1e6) / 1e3);
  const rl = num % 1e3;
  
  let res = '';

  if (bl) {
    if (bl === 1) res += 'مليار';
    else if (bl === 2) res += 'ملياران';
    else if (bl >= 3 && bl <= 10) res += checkHundredsTensOnes(bl) + ' مليارات';
    else res += checkHundredsTensOnes(bl) + ' مليار';
    
    if (ml || tl || rl) res += ' و';
  }

  if (ml) {
    if (ml === 1) res += 'مليون';
    else if (ml === 2) res += 'مليونان';
    else if (ml >= 3 && ml <= 10) res += checkHundredsTensOnes(ml) + ' ملايين';
    else res += checkHundredsTensOnes(ml) + ' مليون';
    
    if (tl || rl) res += ' و';
  }

  if (tl) {
    if (tl === 1) res += 'ألف';
    else if (tl === 2) res += 'ألفان';
    else if (tl >= 3 && tl <= 10) res += checkHundredsTensOnes(tl) + ' آلاف';
    else res += checkHundredsTensOnes(tl) + ' ألف';
    
    if (rl) res += ' و';
  }

  if (rl) {
    res += checkHundredsTensOnes(rl);
  }

  return res || 'صفر';
}

// Pure TypeScript French Tafqeet helper
export function numToFr(n: number): string {
  if (!n || isNaN(n)) return 'zéro';
  const num = Math.floor(n);

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

  function convertUnderThousand(x: number): string {
    if (x === 0) return '';
    let r = '';
    const h = Math.floor(x / 100);
    const rm = x % 100;

    if (h > 0) {
      if (h === 1) {
        r += 'cent';
      } else {
        r += units[h] + ' cent';
        if (rm === 0) r += 's'; // e.g. deux cents
      }
    }

    if (rm > 0) {
      if (h > 0) r += ' ';
      if (rm < 10) {
        r += units[rm];
      } else if (rm < 20) {
        r += teens[rm - 10];
      } else {
        const t = Math.floor(rm / 10);
        const u = rm % 10;
        if (t === 7) {
          r += 'soixante';
          if (u === 1) r += ' et onze';
          else if (u > 1) r += '-' + teens[u];
          else r += '-dix';
        } else if (t === 9) {
          r += 'quatre-vingt';
          if (u > 0) r += '-' + teens[u];
          else r += '-dix';
        } else {
          r += tens[t];
          if (u > 0) {
            if (u === 1) r += ' et un';
            else r += '-' + units[u];
          }
        }
      }
    }
    return r;
  }

  let temp = num;
  let parts: string[] = [];

  const millions = Math.floor(temp / 1e6);
  temp %= 1e6;
  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(convertUnderThousand(millions) + ' millions');
    }
  }

  const thousands = Math.floor(temp / 1e3);
  temp %= 1e3;
  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(convertUnderThousand(thousands) + ' mille');
    }
  }

  if (temp > 0) {
    parts.push(convertUnderThousand(temp));
  }

  return parts.join(' ');
}

/**
 * Safe wrapper for window.alert to prevent DOMException crashes inside sandboxed iframes.
 */
export function safeAlert(msg: string): void {
  try {
    window.alert(msg);
  } catch (e) {
    console.warn("window.alert is blocked in this environment (likely due to sandbox restrictions):", msg);
  }
}

/**
 * Safe wrapper for window.confirm to prevent DOMException crashes inside sandboxed iframes.
 */
export function safeConfirm(msg: string, defaultConfirmed = true): boolean {
  try {
    return window.confirm(msg);
  } catch (e) {
    console.warn("window.confirm is blocked in this environment. Proceeding with:", defaultConfirmed);
    return defaultConfirmed;
  }
}

/**
 * Safe wrapper for localStorage.setItem with Try/Catch and logging integration.
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error(`localStorage.setItem failed for key "${key}":`, e);
    if ((window as any).logError) {
      (window as any).logError(
        'حفظ البيانات (LocalStorage)',
        `فشل حفظ المفتاح "${key}": قد تكون المساحة ممتلئة.`,
        e instanceof Error ? e.message : String(e)
      );
    }
    return false;
  }
}

/**
 * Safe wrapper for localStorage.getItem with Try/Catch and logging integration.
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(`localStorage.getItem failed for key "${key}":`, e);
    if ((window as any).logError) {
      (window as any).logError(
        'قراءة البيانات (LocalStorage)',
        `فشل قراءة المفتاح "${key}": التخزين معطل.`,
        e instanceof Error ? e.message : String(e)
      );
    }
    return null;
  }
}

/**
 * Safe wrapper for localStorage.removeItem with Try/Catch and logging integration.
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error(`localStorage.removeItem failed for key "${key}":`, e);
    if ((window as any).logError) {
      (window as any).logError(
        'حذف البيانات (LocalStorage)',
        `فشل حذف المفتاح "${key}".`,
        e instanceof Error ? e.message : String(e)
      );
    }
    return false;
  }
}


