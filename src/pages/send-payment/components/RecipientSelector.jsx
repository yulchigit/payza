import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const RecipientSelector = ({ selectedRecipient, onRecipientSelect, error }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [manualRecipient, setManualRecipient] = useState({ name: '', phone: '' });

  const recentRecipients = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+998 90 123 4567",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12474730f-1763296027036.png",
    avatarAlt: "Professional woman with brown hair wearing blue business attire smiling at camera",
    lastTransaction: "2026-01-05"
  },
  {
    id: 2,
    name: "Michael Chen",
    phone: "+998 91 234 5678",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1a94acfd5-1763299528067.png",
    avatarAlt: "Asian man with short black hair wearing gray suit and glasses in professional setting",
    lastTransaction: "2026-01-04"
  },
  {
    id: 3,
    name: "Emma Williams",
    phone: "+998 93 345 6789",
    avatar: "https://images.unsplash.com/photo-1713810189199-4e25d6f26dd0",
    avatarAlt: "Young woman with blonde hair in casual white shirt smiling outdoors",
    lastTransaction: "2026-01-03"
  },
  {
    id: 4,
    name: "David Martinez",
    phone: "+998 94 456 7890",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1dc0506c0-1763295779092.png",
    avatarAlt: "Hispanic man with dark hair wearing navy blue polo shirt in bright setting",
    lastTransaction: "2026-01-02"
  }];


  const filteredRecipients = recentRecipients?.filter((recipient) =>
  recipient?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
  recipient?.phone?.includes(searchQuery)
  );

  const handleRecipientClick = (recipient) => {
    onRecipientSelect(recipient);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleManualEntry = () => {
    const nextRecipient = { id: 'manual', name: '', phone: '' };
    setManualRecipient({ name: '', phone: '' });
    onRecipientSelect(nextRecipient);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (selectedRecipient?.id !== 'manual') {
      setManualRecipient({ name: '', phone: '' });
    }
  }, [selectedRecipient]);

  const handleManualChange = (field) => (event) => {
    const value = event?.target?.value || '';
    const next = { ...manualRecipient, [field]: value };
    setManualRecipient(next);
    onRecipientSelect({ id: 'manual', ...next });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="Recipient"
          type="text"
          placeholder="Search by name or phone number"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e?.target?.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          error={error}
          required />

        
        {showDropdown &&
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            <div className="p-2">
              <Button
              variant="ghost"
              fullWidth
              iconName="Plus"
              iconPosition="left"
              onClick={handleManualEntry}
              className="justify-start mb-2">

                Enter manually
              </Button>
              
              {filteredRecipients?.length > 0 ?
            <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-3 py-2">Recent Recipients</p>
                  {filteredRecipients?.map((recipient) =>
              <button
                key={recipient?.id}
                onClick={() => handleRecipientClick(recipient)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left">

                      <img
                  src={recipient?.avatar}
                  alt={recipient?.avatarAlt}
                  className="w-10 h-10 rounded-full object-cover" />

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {recipient?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {recipient?.phone}
                        </p>
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                    </button>
              )}
                </div> :

            <div className="p-8 text-center">
                  <Icon name="Search" size={32} className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No recipients found</p>
                </div>
            }
            </div>
          </div>
        }
      </div>
      {selectedRecipient && selectedRecipient?.id !== 'manual' &&
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <img
          src={selectedRecipient?.avatar}
          alt={selectedRecipient?.avatarAlt}
          className="w-12 h-12 rounded-full object-cover" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {selectedRecipient?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedRecipient?.phone}
            </p>
          </div>
          <Button
          variant="ghost"
          size="icon"
          iconName="X"
          onClick={() => onRecipientSelect(null)} />

        </div>
      }
      {selectedRecipient && selectedRecipient?.id === 'manual' &&
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Input
          label="Recipient Name"
          type="text"
          placeholder="Enter recipient's full name"
          value={manualRecipient?.name}
          onChange={handleManualChange('name')}
          required />

          <Input
          label="Phone Number"
          type="tel"
          placeholder="+998 XX XXX XXXX"
          value={manualRecipient?.phone}
          onChange={handleManualChange('phone')}
          required />

        </div>
      }
    </div>);

};

export default RecipientSelector;
