# frozen_string_literal: true

module Glicko2
  class VolatilitySolver
    def initialize(sigma:, phi:, variance:, delta:)
      @sigma = sigma
      @phi = phi
      @variance = variance
      @delta = delta
    end

    def solve
      bound_a = a
      bound_b = initial_bound_b
      f_a = f(bound_a)
      f_b = f(bound_b)

      while (bound_b - bound_a).abs > CONVERGENCE
        estimate = bound_a + (bound_a - bound_b) * f_a / (f_b - f_a)
        f_estimate = f(estimate)
        if f_estimate * f_b <= 0
          bound_a = bound_b
          f_a = f_b
        else
          f_a /= 2.0
        end
        bound_b = estimate
        f_b = f_estimate
      end

      Math.exp(bound_a / 2.0)
    end

    private

    def a
      @a ||= Math.log(@sigma**2)
    end

    def initial_bound_b
      return Math.log(@delta**2 - @phi**2 - @variance) if @delta**2 > @phi**2 + @variance

      k = 1
      k += 1 while f(a - k * TAU).negative?
      a - k * TAU
    end

    def f(x)
      ex = Math.exp(x)
      ((ex * (@delta**2 - @phi**2 - @variance - ex)) / (2.0 * (@phi**2 + @variance + ex)**2)) -
        ((x - a) / TAU**2)
    end
  end
end
