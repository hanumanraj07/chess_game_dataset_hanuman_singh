import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice.js';
import Button from '../../components/ui/Button.jsx';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
});

const LoginPage = () => {
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
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: (values) => dispatch(loginUser(values)),
  });

  return (
    <>
      <Helmet>
        <title>Login | Chess Match Analytics</title>
        <meta name="description" content="Login to Chess Match Analytics dashboard" />
      </Helmet>

      <div style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, var(--color-surface) 39px, var(--color-surface) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, var(--color-surface) 39px, var(--color-surface) 40px)',
          opacity: 0.4,
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
          {/* Card */}
          <div style={{
            background: 'var(--color-bg-alt)',
            border: 'var(--border-brutal)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Header */}
            <div style={{
              padding: 'var(--space-5)',
              borderBottom: 'var(--border-thick)',
              background: 'var(--color-black)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>♟</div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-2xl)',
                color: 'var(--color-bg)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 4,
              }}>
                Chess Analytics
              </h1>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                Match Intelligence Platform
              </p>
            </div>

            {/* Form */}
            <div style={{ padding: 'var(--space-5)' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--font-size-lg)',
                marginBottom: 'var(--space-4)',
                letterSpacing: '0.06em',
                borderBottom: 'var(--border-thin)',
                paddingBottom: 'var(--space-3)',
              }}>
                LOGIN
              </h2>

              <form onSubmit={formik.handleSubmit} noValidate id="login-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className={`brutal-input ${formik.touched.email && formik.errors.email ? 'error' : ''}`}
                    placeholder="admin@chess.com"
                    {...formik.getFieldProps('email')}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="form-error">{formik.errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    className={`brutal-input ${formik.touched.password && formik.errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                    {...formik.getFieldProps('password')}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <span className="form-error">{formik.errors.password}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                  id="login-submit-btn"
                >
                  LOGIN →
                </Button>
              </form>

              <p style={{
                marginTop: 'var(--space-4)',
                fontFamily: 'var(--font-ui)',
                fontSize: 'var(--font-size-sm)',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}>
                No account?{' '}
                <Link
                  to="/register"
                  id="go-to-register-link"
                  style={{ color: 'var(--color-green)', fontWeight: 700 }}
                >
                  REGISTER →
                </Link>
              </p>
            </div>
          </div>

          {/* Bottom tag */}
          <div style={{
            marginTop: 'var(--space-3)',
            fontFamily: 'var(--font-display)',
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-muted)',
            textAlign: 'center',
          }}>
            Chess Analytics Platform — Real Data Only
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
