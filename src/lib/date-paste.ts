/**
 * Handler de onPaste para inputs type="date".
 * Converte formatos comuns (dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy) para yyyy-mm-dd.
 * Uso: <input type="date" onPaste={(e) => handleDatePaste(e, (val) => setField(val))} />
 */
export function handleDatePaste(
  e: React.ClipboardEvent<HTMLInputElement>,
  setValue: (isoDate: string) => void
) {
  const pasted = e.clipboardData.getData("text").trim();
  if (!pasted) return;

  // Tentar parsear formatos brasileiros: dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy
  const brMatch = pasted.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    const d = day.padStart(2, "0");
    const m = month.padStart(2, "0");
    const iso = `${year}-${m}-${d}`;
    // Validar se é uma data real
    const date = new Date(iso);
    if (!isNaN(date.getTime())) {
      e.preventDefault();
      setValue(iso);
      return;
    }
  }

  // Tentar formato ISO: yyyy-mm-dd
  const isoMatch = pasted.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const iso = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const date = new Date(iso);
    if (!isNaN(date.getTime())) {
      e.preventDefault();
      setValue(iso);
      return;
    }
  }
}
