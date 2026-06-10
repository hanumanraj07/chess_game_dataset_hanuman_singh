import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice.js';
import Button from '../../components/ui/Button.jsx';

const validationSchema = Yup.object({
  name: Yup.string().min(3, 'Min 3 characters').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm password'),
});

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error.toUpperCase());
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', confirmPassword: '' },
    validationSchema,
    onSubmit: ({ name, email, password }) => dispatch(registerUser({ name, email, password })),
  });

  const fields = [
    { id: 'reg-name', name: 'name', label: 'Username / Name', type: 'text', placeholder: 'chessmaster99' },
    { id: 'reg-email', name: 'email', label: 'Email Address', type: 'email', placeholder: 'user@chess.com' },
    { id: 'reg-password', name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
    { id: 'reg-confirm', name: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
  ];

  return (
    <>
      <Helmet>
        <title>Register | Chess Match Analytics</title>
        <meta name="description" content="Create a Chess Match Analytics account" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}>
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, var(--color-surface) 39px, var(--color-surface) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, var(--color-surface) 39px, var(--color-surface) 40px)',
          opacity: 0.4,
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 480 }}>
          <div style={{
            background: 'var(--color-bg-alt)',
            border: 'var(--border-brutal)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{
              padding: 'var(--space-5)',
              borderBottom: 'var(--border-thick)',
              background: 'var(--color-green)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>♟</div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-white)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Create Account
              </h1>
            </div>

            <div style={{ padding: 'var(--space-5)' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--space-4)',
                letterSpacing: '0.06em',
                borderBottom: 'var(--border-thin)',
                paddingBottom: 'var(--space-3)',
              }}>
                REGISTER
              </h2>

              <form onSubmit={formik.handleSubmit} noValidate id="register-form">
                {fields.map(({ id, name, label, type, placeholder }) => (
                  <div key={name} className="form-group">
                    <label className="form-label" htmlFor={id}>{label}</label>
                    <input
                      id={id}
                      name={name}
                      type={type}
                      className={`brutal-input ${formik.touched[name] && formik.errors[name] ? 'error' : ''}`}
                      placeholder={placeholder}
                      {...formik.getFieldProps(name)}
                    />
                    {formik.touched[name] && formik.errors[name] && (
                      <span className="form-error">{formik.errors[name]}</span>
                    )}
                  </div>
                ))}

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  id="register-submit-btn"
                >
                  CREATE ACCOUNT →
                </Button>
              </form>

              <p style={{
                marginTop: 'var(--space-4)',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}>
                Have an account?{' '}
                <Link to="/login" id="go-to-login-link" style={{ color: 'var(--color-green)', fontWeight: 700 }}>
                  LOGIN →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
