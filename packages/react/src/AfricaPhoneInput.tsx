import React, { useState, useEffect } from "react";
import { wezas } from "wezas-africa-toolkit";
import { AFRICAN_COUNTRIES, CountryOption } from "./countries.js";

export interface AfricaPhoneInputProps {
  value?: string;
  defaultCountry?: string;
  onChange?: (value: string, fullInternational: string, country: CountryOption) => void;
  onValid?: (data: any) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function AfricaPhoneInput({
  value = "",
  defaultCountry = "CI",
  onChange,
  onValid,
  className = "",
  placeholder,
  disabled = false,
}: AfricaPhoneInputProps) {
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState(value);
  const [carrier, setCarrier] = useState<{ nom: string; mobileMoney: boolean } | null>(null);

  const country = AFRICAN_COUNTRIES.find((c) => c.iso2 === countryCode) || AFRICAN_COUNTRIES[0];

  useEffect(() => {
    setPhoneNumber(value);
  }, [value]);

  const handlePhoneChange = async (rawVal: string) => {
    setPhoneNumber(rawVal);
    const full = `${country.dialCode}${rawVal.replace(/\s+/g, "")}`;
    onChange?.(rawVal, full, country);

    // Validation temps réel dès qu'on a un nombre suffisant de chiffres
    const digitsOnly = rawVal.replace(/\D/g, "");
    if (digitsOnly.length >= 8) {
      try {
        const res = await wezas.validerTelephone(country.iso2, rawVal);
        if (res.ok && res.data?.valide) {
          setCarrier({
            nom: res.data.operateur_probable || "Opérateur Détecté",
            mobileMoney: Boolean(res.data.mobile_money && res.data.mobile_money.length > 0),
          });
          onValid?.(res.data);
        } else {
          setCarrier(null);
        }
      } catch {
        setCarrier(null);
      }
    } else {
      setCarrier(null);
    }
  };

  return (
    <div
      className={`relative flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2.5 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all ${
        disabled ? "opacity-60 pointer-events-none" : ""
      } ${className}`}
    >
      <select
        value={countryCode}
        disabled={disabled}
        onChange={(e) => {
          setCountryCode(e.target.value);
          const newCountry = AFRICAN_COUNTRIES.find((c) => c.iso2 === e.target.value) || country;
          onChange?.(phoneNumber, `${newCountry.dialCode}${phoneNumber.replace(/\s+/g, "")}`, newCountry);
        }}
        className="bg-slate-950 text-white font-medium text-xs sm:text-sm px-2 py-1.5 rounded-lg border border-slate-800 outline-none cursor-pointer"
      >
        {AFRICAN_COUNTRIES.map((c) => (
          <option key={c.iso2} value={c.iso2}>
            {c.flag} {c.dialCode} ({c.name})
          </option>
        ))}
      </select>

      <input
        type="tel"
        disabled={disabled}
        value={phoneNumber}
        onChange={(e) => handlePhoneChange(e.target.value)}
        placeholder={placeholder || country.example}
        className="bg-transparent flex-1 text-white font-mono text-sm outline-none placeholder-slate-500 min-w-0"
      />

      {carrier && (
        <span
          className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md ${
            carrier.mobileMoney
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-slate-800 text-slate-300"
          }`}
        >
          {carrier.nom}
        </span>
      )}
    </div>
  );
}
