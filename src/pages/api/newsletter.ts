
export const prerender = false;
import type { APIRoute } from 'astro';
import { Resend } from 'resend';


const resendApiKey = import.meta.env.RESEND_API_KEY;

export const POST: APIRoute = async ({ request }) => {
    try {
        if (typeof resendApiKey !== 'string' || resendApiKey.trim() === '') {
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
        }

        const resend = new Resend(resendApiKey);
        const data = await request.formData();
        const email = data.get('email')?.toString();

        if (!email) {
            return new Response(JSON.stringify({ error: 'E-mail é obrigatório' }), { status: 400 });
        }

        const { data: resendData, error } = await resend.emails.send({
            from: 'Rise Idiomas <no-reply@diegogenuino.dev>',
            to: [email],
            subject: 'Inscrição realizada com sucesso!',
            html: '<strong>Muito obrigado por se inscrever na nossa newsletter!</strong>',
        });

        if (error) {
            console.error('[Resend error]', JSON.stringify(error, null, 2));
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};