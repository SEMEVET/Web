import { useMemo, useState } from 'react'

export type SearchableSelectOption = {
  value: string
  label: string
  searchText?: string
}

type SearchableSelectProps = {
  disabled?: boolean
  emptyText?: string
  options: SearchableSelectOption[]
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function SearchableSelect({
  disabled = false,
  emptyText = 'Sin resultados',
  options,
  placeholder,
  value,
  onChange,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedOption = options.find((option) => option.value === value)
  const inputValue = isOpen ? query : selectedOption?.label ?? ''

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(query)
    if (!normalizedQuery) return options

    return options.filter((option) =>
      normalizeText(`${option.label} ${option.searchText ?? ''}`).includes(normalizedQuery),
    )
  }, [options, query])

  function selectOption(option: SearchableSelectOption) {
    onChange(option.value)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className={disabled ? 'searchable-select is-disabled' : 'searchable-select'}>
      <input
        autoComplete="off"
        disabled={disabled}
        placeholder={placeholder}
        type="search"
        value={inputValue}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setIsOpen(true)
        }}
      />

      {isOpen && !disabled && (
        <div className="searchable-select-menu">
          {filteredOptions.length === 0 ? (
            <span className="searchable-select-empty">{emptyText}</span>
          ) : (
            filteredOptions.map((option) => (
              <button
                className={option.value === value ? 'is-selected' : undefined}
                key={option.value}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault()
                  selectOption(option)
                }}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
