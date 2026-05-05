import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';

export const ensureUserCookie = async (req: Request, res: Response, next: NextFunction) => {
    let userId = req.cookies.user_id;

    if (!userId) {
        // Создаём нового пользователя
        userId = uuidv4();
        
        // Создаём запись в Supabase
        const { error } = await supabase
            .from('users')
            .insert([
                { 
                    user_id: userId,
                    base_currency: 'USD',
                    favorites: []
                }
            ]);

        if (error) {
            console.error('Error creating user:', error);
            // Продолжаем даже при ошибке БД, но с кукой
        }

        // Устанавливаем httpOnly cookie
        res.cookie('user_id', userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });
    }

    // Добавляем userId в объект запроса для дальнейшего использования
    (req as any).userId = userId;
    
    next();
};