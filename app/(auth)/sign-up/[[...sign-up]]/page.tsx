import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Create an Account</h1>
                <p className="text-muted-foreground mt-2">Join ChatApp to start messaging</p>
            </div>
            <SignUp />
        </div>
    );
}
