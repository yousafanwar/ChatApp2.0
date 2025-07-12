interface CardProps {
  sender: string;
  text: string;
  timeStamp: { type: Date };
}

const Card = (props: CardProps) => {


 
  return (
    <div>
      <p>{props.text}</p>
    </div>
  );
};

export default Card;
