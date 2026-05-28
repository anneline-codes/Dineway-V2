import './Spinner.css';

const Spinner = ({ size = 'md' }) => {
  return (
    <div className={`spinner-container spinner-${size}`}>
      <div className="spinner"></div>
    </div>
  );
};

export default Spinner;