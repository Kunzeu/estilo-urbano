"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Type, Image as ImageIcon, Palette, Download, Undo, Redo } from "lucide-react"
import { useState } from "react"

export default function PersonalizarPage() {
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [textContent, setTextContent] = useState("")
  const [fontSize, setFontSize] = useState(16)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Personaliza tu Camiseta
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Crea tu diseño único con nuestro editor avanzado. Añade texto, imágenes y personaliza tu estilo.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Editor Canvas */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Editor de Diseño</CardTitle>
                <CardDescription>
                  Arrastra elementos al canvas para crear tu diseño
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Palette className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">
                      Área de diseño
                    </p>
                    <p className="text-sm text-gray-400">
                      El editor de diseño estará disponible próximamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Panel */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Text Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Texto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="text-content">Contenido</Label>
                    <Input
                      id="text-content"
                      placeholder="Escribe tu texto aquí..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="font-size">Tamaño de fuente</Label>
                    <Input
                      id="font-size"
                      type="number"
                      min="8"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Color del texto</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-10 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button className="w-full">
                    <Type className="w-4 h-4 mr-2" />
                    Añadir Texto
                  </Button>
                </CardContent>
              </Card>

              {/* Image Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Imágenes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">
                      Arrastra una imagen aquí o
                    </p>
                    <Button variant="outline" size="sm">
                      Seleccionar Archivo
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      Galería
                    </Button>
                    <Button variant="outline" size="sm">
                      Iconos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Undo className="w-4 h-4 mr-1" />
                      Deshacer
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Redo className="w-4 h-4 mr-1" />
                      Rehacer
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Diseño
                  </Button>
                  <Button className="w-full">
                    <Palette className="w-4 h-4 mr-2" />
                    Añadir al Carrito
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Templates Section */}
        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas Populares</CardTitle>
              <CardDescription>
                Comienza con una de nuestras plantillas prediseñadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((template) => (
                  <div
                    key={template}
                    className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-gray-500 text-sm">Plantilla {template}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
} 