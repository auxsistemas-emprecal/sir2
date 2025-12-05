// controllers/authController.js
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";

export const registrarUsuario = async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        // Convertir la contraseña en hash seguro
        const hash = await hashPassword(contrasena);

        // Guardar usuario en BD (ejemplo)
        await db.usuarios.insert({
            usuario,
            password_hash: hash
        });

        res.json({ mensaje: "Usuario registrado correctamente" });

    } catch (error) {
        res.status(500).json({ error: "Error en servidor" });
    }
};

// Inicio de sesión (comparar hash) con db Cambiar 

export const loginUsuario = async (req, res) => {
    const { usuario, contrasena } = req.body;

    try {
        const user = await db.usuarios.findOne({ usuario });                 
        if (!user) {
            return res.status(400).json({ error: "Usuario no existe" });
        }

        // Comparar contraseña ingresada con el hash guardado
        const valid = await comparePassword(contrasena, user.password_hash);

        if (!valid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        res.json({ mensaje: "Acceso permitido" });

    } catch (error) {
        res.status(500).json({ error: "Error en servidor" });
    }
};
