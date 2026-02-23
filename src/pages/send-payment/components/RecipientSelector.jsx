import React, { useEffect, useMemo, useState } from "react";
import Icon from "../../../components/AppIcon";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

const RecipientSelector = ({
  selectedRecipient,
  onRecipientSelect,
  error,
  recipients = [],
  isLoadingRecipients = false,
  onDeleteRecipient = null,
  deletingRecipientIds = []
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualRecipient, setManualRecipient] = useState({ name: "", phone: "" });

  const filteredRecipients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recipients;

    return recipients.filter((recipient) => {
      const name = String(recipient?.name || "").toLowerCase();
      const phone = String(recipient?.phone || "").toLowerCase();
      return name.includes(query) || phone.includes(query);
    });
  }, [recipients, searchQuery]);

  const handleRecipientClick = (recipient) => {
    onRecipientSelect(recipient);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleManualEntry = () => {
    const nextRecipient = { id: "manual", name: "", phone: "" };
    setManualRecipient({ name: "", phone: "" });
    onRecipientSelect(nextRecipient);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (selectedRecipient?.id !== "manual") {
      setManualRecipient({ name: "", phone: "" });
    }
  }, [selectedRecipient]);

  const handleManualChange = (field) => (event) => {
    const value = event?.target?.value || "";
    const next = { ...manualRecipient, [field]: value };
    setManualRecipient(next);
    onRecipientSelect({ id: "manual", ...next });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="Recipient"
          type="text"
          placeholder="Search by name or phone number"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event?.target?.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          error={error}
          required
        />

        {showDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2">
              <Button
                variant="ghost"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                onClick={handleManualEntry}
                className="justify-start mb-2"
              >
                Enter manually
              </Button>

              {isLoadingRecipients ? (
                <div className="p-6 text-center text-sm text-muted-foreground">Loading favorites...</div>
              ) : filteredRecipients?.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-3 py-2">Saved Recipients</p>
                  {filteredRecipients?.map((recipient) => (
                    <div key={recipient?.id} className="w-full flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRecipientClick(recipient)}
                        className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name="User" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{recipient?.name}</p>
                          <p className="text-xs text-muted-foreground">{recipient?.phone}</p>
                        </div>
                        <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        iconName="Trash2"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteRecipient?.(recipient)}
                        loading={deletingRecipientIds.includes(recipient?.id)}
                        disabled={deletingRecipientIds.includes(recipient?.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Icon name="Search" size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No recipients found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedRecipient && selectedRecipient?.id !== "manual" && (
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon name="User" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{selectedRecipient?.name}</p>
            <p className="text-xs text-muted-foreground">{selectedRecipient?.phone}</p>
          </div>
          <Button variant="ghost" size="icon" iconName="X" onClick={() => onRecipientSelect(null)} />
        </div>
      )}

      {selectedRecipient && selectedRecipient?.id === "manual" && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Input
            label="Recipient Name"
            type="text"
            placeholder="Enter recipient's full name"
            value={manualRecipient?.name}
            onChange={handleManualChange("name")}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            placeholder="+998 XX XXX XXXX"
            value={manualRecipient?.phone}
            onChange={handleManualChange("phone")}
            required
          />
        </div>
      )}
    </div>
  );
};

export default RecipientSelector;
