export default function InputField({ label, type = "text", value, onChange, ...props }) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  )
}
