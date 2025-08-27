from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re
from django.core.validators import RegexValidator


class MaximumLengthPasswordValidator:
    def __init__(self, max_length=64):
        self.max_length = max_length

    def validate(self, password, user=None):
        if len(password) > self.max_length:
            raise ValidationError(
                _(
                    "This password is too long. It must not contain more than %(max_length)d characters."
                ),
                code="password_too_long",
                params={"max_length": self.max_length},
            )

    def get_help_text(self):
        return _(
            "Your password must not contain more than %(max_length)d characters."
            % {"max_length": self.max_length}
        )


import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _


class RegexPasswordValidator:
    ALLOWED_SYMBOLS = "!@#$%^&*()_+-=[]{};:,.?~"

    def __init__(self):
        esc = re.escape(self.ALLOWED_SYMBOLS)
        self._allowed_single = re.compile(rf"[A-Za-z0-9{esc}]")
        self._allowed_full = re.compile(rf"^[A-Za-z0-9{esc}]+$")
        self._space = re.compile(r"\s")
        self._lower = re.compile(r"[a-z]")
        self._upper = re.compile(r"[A-Z]")
        self._digit = re.compile(r"\d")
        self._symbol = re.compile(rf"[{esc}]")

    def validate(self, password: str, user=None):
        errors: list[str] = []

        if not self._allowed_full.fullmatch(password):
            invalid = sorted(
                {
                    ch
                    for ch in password
                    if not self._allowed_single.fullmatch(ch)
                    and not self._space.fullmatch(ch)
                }
            )
            if invalid:
                errors.append(
                    _(
                        "Password contains invalid character(s): %(chars)s. "
                        "Allowed symbols: %(symbols)s."
                    )
                    % {"chars": "".join(invalid), "symbols": self.ALLOWED_SYMBOLS}
                )
        if self._space.search(password):
            errors.append(_("Password must not contain spaces."))
        if not self._lower.search(password):
            errors.append(_("Password must contain at least one lowercase letter."))
        if not self._upper.search(password):
            errors.append(_("Password must contain at least one uppercase letter."))
        if not self._digit.search(password):
            errors.append(_("Password must contain at least one digit."))
        if not self._symbol.search(password):
            errors.append(
                _("Password must contain at least one of: %(symbols)s.")
                % {"symbols": self.ALLOWED_SYMBOLS}
            )

        if errors:
            raise ValidationError(errors, code="password_complexity")  # type: ignore[arg-type]

    def get_help_text(self):
        return _(
            "Your password must include at least one uppercase letter, one lowercase letter, "
            "one digit, and one of: %(symbols)s. It must not contain spaces or other characters."
        ) % {"symbols": self.ALLOWED_SYMBOLS}


letters_only_regex = r"^[^\W\d_]+$"


first_name_validator = RegexValidator(
    regex=letters_only_regex,
    message="First name may only contain letters.",
    code="invalid_first_name",
)

last_name_validator = RegexValidator(
    regex=letters_only_regex,
    message="Last name may only contain letters.",
    code="invalid_last_name",
)
