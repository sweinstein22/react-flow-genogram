const PersonCard = ({ data }) => {
  if (!data) return <div />;

  const { name } = data;
  return (
    <div
      style={{
        background: "white",
        border: "1px solid black",
        borderRadius: "4px",
        padding: "8px",
      }}
    >
      Name: {name}
    </div>
  );
};

export default PersonCard;
