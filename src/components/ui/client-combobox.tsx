import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { fetchThirdparties, Thirdparty } from "@/services/dashboard-api"

interface ClientComboBoxProps {
    value?: string
    onChange: (value: string) => void
}

export function ClientComboBox({ value, onChange }: ClientComboBoxProps) {
    const [open, setOpen] = React.useState(false)
    const [clients, setClients] = React.useState<Thirdparty[]>([])
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const loadClients = async () => {
            setLoading(true)
            try {
                const data = await fetchThirdparties()
                setClients(data)
            } catch (err) {
                console.error("Chargement des clients echoué", err)
                setError("Erreur chargement clients")
            } finally {
                setLoading(false)
            }
        }

        loadClients()
    }, [])

    const selectedClient = clients.find((client) => client.id === value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[300px] justify-between"
                >
                    {value
                        ? selectedClient?.name || "Client introuvable"
                        : "Sélectionner un client..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher un client..." />
                    <CommandList>
                        <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                        <CommandGroup>
                            {loading && <CommandItem disabled>Chargement...</CommandItem>}
                            {error && <CommandItem disabled>{error}</CommandItem>}
                            {!loading && !error && clients.map((client) => (
                                <CommandItem
                                    key={client.id}
                                    value={client.name}
                                    onSelect={() => {
                                        onChange(client.id === value ? "" : client.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === client.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {client.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
