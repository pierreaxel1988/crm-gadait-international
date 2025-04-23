
const OwnerPriceFields: React.FC<OwnerPriceFieldsProps> = ({ lead, onDataChange }) => {
  const handleFurnishedToggle = () => {
    const updatedFurnished = !lead.furnished;
    onDataChange({ 
      furnished: updatedFurnished,
      // Reset furniture details when toggling furnished status
      furniture_included_in_price: updatedFurnished ? true : undefined,
      furniture_price: updatedFurnished ? undefined : lead.furniture_price
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 pt-2">
        <Label htmlFor="furnished" className="text-sm">Meublé</Label>
        <button
          id="furnished"
          type="button"
          aria-pressed={!!lead.furnished}
          onClick={handleFurnishedToggle}
          className={`w-12 h-7 inline-flex rounded-full border border-gray-300 bg-gray-100 transition relative focus:outline-none ${
            lead.furnished ? 'bg-primary border-primary' : ''
          }`}
        >
          <span
            className={`block w-6 h-6 bg-white rounded-full shadow transform transition ${
              lead.furnished ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="ml-2 text-xs font-futura">
          {lead.furnished ? 'Oui' : 'Non'}
        </span>
      </div>

      {lead.furnished && (
        <>
          <div className="space-y-2 mt-2">
            <Label htmlFor="furniture_included" className="text-sm">Mobilier inclus dans le prix</Label>
            <div className="flex items-center gap-3">
              <button
                id="furniture_included"
                type="button"
                aria-pressed={lead.furniture_included_in_price}
                onClick={() => onDataChange({ 
                  furniture_included_in_price: !lead.furniture_included_in_price,
                  furniture_price: !lead.furniture_included_in_price ? undefined : lead.furniture_price
                })}
                className={`w-12 h-7 inline-flex rounded-full border border-gray-300 bg-gray-100 transition relative focus:outline-none ${
                  lead.furniture_included_in_price ? 'bg-primary border-primary' : ''
                }`}
              >
                <span
                  className={`block w-6 h-6 bg-white rounded-full shadow transform transition ${
                    lead.furniture_included_in_price ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="ml-2 text-xs font-futura">
                {lead.furniture_included_in_price ? 'Oui' : 'Non'}
              </span>
            </div>
          </div>

          {!lead.furniture_included_in_price && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="furniture_price" className="text-sm">Valorisation du mobilier</Label>
              <Input
                id="furniture_price"
                value={lead.furniture_price || ''}
                onChange={e => onDataChange({ furniture_price: e.target.value })}
                placeholder="Ex : 45 000"
                className="w-full font-futura"
                type="text"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
