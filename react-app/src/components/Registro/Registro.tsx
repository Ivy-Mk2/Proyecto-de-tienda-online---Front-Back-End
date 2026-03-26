import './Registro.css';

const accessMethods = [
  {
    key: 'google',
    label: 'Continuar con Google',
    icon: 'G',
    modifier: 'registro__button--google',
  },
  {
    key: 'phone',
    label: 'Continuar con tu celular',
    icon: '☎',
    modifier: 'registro__button--phone',
  },
  {
    key: 'facebook',
    label: 'Continuar con Facebook',
    icon: 'f',
    modifier: 'registro__button--facebook',
  },
  {
    key: 'apple',
    label: 'Continuar con Apple',
    icon: '',
    modifier: 'registro__button--apple',
  },
];

const Registro = () => {
  return (
    <section className="registro" aria-label="Registro de usuario">
      <aside className="registro__promo" aria-hidden="true">
        <div className="registro__promo-overlay" />
        <div className="registro__promo-content">
          <p className="registro__promo-highlight">¡30 DÍAS DE ENVÍOS GRATIS!</p>
          <p className="registro__promo-subtitle">Pagando con tu tarjeta</p>
          <p className="registro__promo-note">*Aplican términos y condiciones, válido solo para usuarios nuevos.</p>
        </div>
      </aside>

      <div className="registro__panel">
        <div className="registro__panel-inner">
          <h1 className="registro__title">Regístrate o ingresa para continuar</h1>

          <div className="registro__buttons" role="group" aria-label="Métodos de registro">
            {accessMethods.map((method) => (
              <button key={method.key} type="button" className={`registro__button ${method.modifier}`}>
                <span className="registro__icon" aria-hidden="true">
                  {method.icon}
                </span>
                {method.label}
              </button>
            ))}

            <button type="button" className="registro__button registro__button--outline">
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Registro;
