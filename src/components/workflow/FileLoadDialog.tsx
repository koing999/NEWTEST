'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileJson, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'; // Note: Dialog might not be installed yet, checking plan.
// Wait, I didn't install Dialog in the plan, only AlertDialog. 
// I should use a simple modal or install Dialog. 
// shadcn's AlertDialog is for alerts. Dialog is for modals.
// I'll assume I need to install Dialog or use a custom one.
// Let's check if I can use AlertDialog for this or if I should install Dialog.
// The user recommended shadcn/ui. I should install Dialog too.
// I'll add a step to install Dialog.
// For now, I'll write the code assuming Dialog is available, and I'll install it in parallel or next.
// Actually, I'll use a simple implementation first or just install it now.
// Let's install 'dialog' component from shadcn first to be safe.
// Wait, I can't run commands inside write_to_file.
// I will write the file assuming I will install 'dialog' next.

import { cn } from '@/lib/utils';

interface FileLoadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onFileSelect: (file: File) => void;
}

export default function FileLoadDialog({
    open,
    onOpenChange,
    onFileSelect
}: FileLoadDialogProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
            onFileSelect(acceptedFiles[0]);
            onOpenChange(false);
        }
    }, [onFileSelect, onOpenChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/json': ['.json']
        },
        maxFiles: 1
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>워크플로우 불러오기</DialogTitle>
                    <DialogDescription>
                        JSON 파일을 여기에 끌어다 놓거나 클릭하여 선택하세요.
                    </DialogDescription>
                </DialogHeader>

                <div
                    {...getRootProps()}
                    className={cn(
                        "mt-4 border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-200 ease-in-out flex flex-col items-center justify-center gap-4",
                        isDragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="p-4 bg-gray-100 rounded-full">
                        <Upload className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="text-sm text-gray-600">
                        {isDragActive ? (
                            <p className="font-medium text-blue-600">여기에 파일을 놓으세요</p>
                        ) : (
                            <p>
                                <span className="font-medium text-blue-600">클릭하여 업로드</span>
                                {' '}또는 파일을 여기로 드래그
                            </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">JSON 파일만 지원됩니다</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
