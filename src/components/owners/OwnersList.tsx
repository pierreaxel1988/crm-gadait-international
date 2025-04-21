
import React from "react";
import OwnerCard from "./OwnerCard";

interface OwnersListProps {
  owners: any[];
}

const OwnersList: React.FC<OwnersListProps> = ({ owners }) => {
  if (!owners.length) {
    return <div className="text-center text-xs text-muted-foreground py-8">Aucun propriétaire trouvé.</div>;
  }

  return (
    <div className="grid gap-3">
      {owners.map((owner) => (
        <OwnerCard key={owner.id} owner={owner} />
      ))}
    </div>
  );
};

export default OwnersList;
